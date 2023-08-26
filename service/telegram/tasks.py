from distutils import command
from email.mime import image
from hashlib import new
from service.celery_app import app
import asyncio
from distutils.command.clean import clean
from telethon import TelegramClient
from telethon import utils
# from django.core.files.images import ImageFile
from PIL import Image
from asgiref.sync import sync_to_async
import os
from django.core.files import File
from .models import Sources, Posts, Comments, Projects, Promts, GptPosts, TGUser
import datetime
from celery import group, shared_task
from telethon.errors import SessionPasswordNeededError
import openai
import tiktoken


api_id = '28410116'
api_hash = '2fc4498ba27db1a3b03576ad81d5440d'
session='anon'
openai.api_key = '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'
GPT_MODEL='gpt-3.5-turbo-16k'
MAX_TOKENS = 10000

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.encoding_for_model(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

@sync_to_async
def create_post(source_id, post_id, date, post_text, user_object):
    if len(user_object) != 0:
        try:
            user = TGUser.objects.get(**user_object)
        except Exception as e:
            user = TGUser.objects.create(**user_object)
    try:
        post = Posts.objects.filter(id = (str(source_id) + '@' + str(post_id))).exists()
        if not post and post_text not in ['', ' ', '\n']:
            if len(user_object) != 0:
                new_post = Posts(id=(str(source_id) + '@' + str(post_id)), post_text=post_text, date=date, source_id=Sources.objects.get(id=source_id), user_id=user)
            else:
                new_post = Posts(id=(str(source_id) + '@' + str(post_id)), post_text=post_text, date=date, source_id=Sources.objects.get(id=source_id))
            new_post.save()
    except Exception as e:
        print(f'\n\n {e} \n\n')


@sync_to_async
def create_comment(source_id, post_id, comment_id, comment_text):
    try:
        comment = Comments.objects.filter(id = (str(source_id) + '@' + str(post_id) + '@' + str(comment_id))).exists()
        if not comment:
                new_comment = Comments(id=(str(source_id) + '@' + str(post_id) + '@' + str(comment_id)), comment_text=comment_text, source_id=Sources.objects.get(id=source_id))
                new_comment.save()
    except Exception as e:
        print(f'\n\n {e} \n\n')


def parse_telegram_chanel(source_id, channel_url: str, offset_date: datetime):
    client = TelegramClient('anon', api_id, api_hash)
    async def task():
        async for message in client.iter_messages(channel_url, offset_date=offset_date, reverse=True):
            post_text = str(message.text)
            date=message.date
            post_id=message.id
            user_object = {}
            try:
                user = (await message.get_sender())
                user_object = {'username': str(user.username), 'user_id': user.id}
            except Exception as e:
                print(e)
            if post_id:
                await create_post(source_id, post_id, date, post_text, user_object)
                try:
                    async for comment in client.iter_messages(channel_url, reply_to=post_id,):
                        comment_id = comment.id
                        try:
                            Posts.objects.get(id__icontains=f'@{comment_id}')
                            comment_text = str(comment.text)
                            if comment_id:
                                await create_comment(source_id, post_id, comment_id, comment_text)
                        except:
                            pass
                except Exception as e:
                    pass
    with client:
        client.loop.run_until_complete(task())
        # print('finish parse')
    return f'chanel: {channel_url} updated'

@app.task
def parse_data():
    sources = Sources.objects.all()
    current_date = datetime.datetime.now(datetime.timezone.utc)
    offset_date = current_date - datetime.timedelta(minutes=30)
    for source in sources:
        if source.type == 'telegram':
            parse_telegram_chanel(source.id ,source.url, offset_date)
    return 'Updates complited'


def get_gpt_response(promt_text: str, posts_text) -> str:
    response = openai.ChatCompletion.create(
        model=GPT_MODEL,
        messages = [
            {"role": "system", "content": f'{promt_text}'},
            {"role": "user", "content": f'{posts_text}'},
        ]
    )
    return response['choices'][0]['message']['content']

def get_posts_dict(project, prev_hour_date, current_date) -> dict:
    posts = {}
    #all posts in sources
    for source in project.sourses.all():
        # print('go gpt')
        posts_l = source.posts.filter(date__range=[prev_hour_date, current_date])
        # no reason create zero posts public key
        if len(posts_l) != 0:
            posts[f'{source.title}'] = []
            for post in posts_l:
                user = 'аноним'
                try:
                    user_object = post.user_id
                    if user_object is not None:
                        user = user_object.username
                except Exception as e:
                    print(e)
                #adding messages for source grouping
                posts[f'{source.title}'].append(f'[{user}]:')
                posts[f'{source.title}'].append(post.post_text)
    return posts

def get_responces_from_gpt(current_promt, posts):
    responces_text = []
    promt_tokens = num_tokens_from_string(current_promt.promt_text, GPT_MODEL)
    while len(posts) > 0:
        count_tokens = promt_tokens
        message_tokens = []
        for key, value in posts.copy().items():
            tmp_count_tokens = num_tokens_from_string(f'[{key}]:' , GPT_MODEL)
            if tmp_count_tokens + count_tokens <= MAX_TOKENS:
                count_tokens += tmp_count_tokens
                message_tokens.append(f'[{key}]:')
                i = 0
                while i < len(value):
                    tmp_count_tokens = num_tokens_from_string(value[i], GPT_MODEL)
                    if count_tokens + tmp_count_tokens > MAX_TOKENS:
                        posts[key] = value[i:]
                        break
                    count_tokens += tmp_count_tokens
                    message_tokens.append(value[i])
                    i+=1
                if i == len(value):
                    posts.pop(key, None)
            else:
                break
            if count_tokens > MAX_TOKENS:
                break
        responces_text.append(get_gpt_response(current_promt.promt_text, ' '.join(message_tokens)))
    return responces_text

@app.task
def get_gpt_posts_hour():
    current_time = datetime.datetime.now(datetime.timezone.utc)
    prev_hour_date = current_time - datetime.timedelta(hours=1)
    projects = Projects.objects.all()
    for project in projects:
        if project.update_time == datetime.time(1, 0):
            current_promt = Promts.objects.get(id=project.current_promt)
            posts = get_posts_dict(project, prev_hour_date, current_time)
            if len(posts) != 0:
                responces_text = get_responces_from_gpt(current_promt, posts)
                GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt)
    return 'Succes'

@app.task
def get_gpt_posts_day():
    current_time = datetime.datetime.now(datetime.timezone.utc)
    prev_hour_date = current_time - datetime.timedelta(days=1)
    projects = Projects.objects.all()
    for project in projects:
        if project.update_time == datetime.time(0, 0):
            current_promt = Promts.objects.get(id=project.current_promt)
            posts = get_posts_dict(project, prev_hour_date, current_time)
            if len(posts) != 0:
                responces_text = get_responces_from_gpt(current_promt, posts)
                GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt, long_type=datetime.time(0,0))
    return 'Succes'


@shared_task()
def create_project_update_data(project_id):
    project = Projects.objects.get(id=project_id)
    current_date = datetime.datetime.now(datetime.timezone.utc)
    prev_hour_date = current_date - datetime.timedelta(hours=1)
    current_promt = Promts.objects.get(id=project.current_promt)
    for source in project.sourses.all():
        if source.type == 'telegram':
            parse_telegram_chanel(source.id ,source.url, prev_hour_date)

    posts = get_posts_dict(project, prev_hour_date, current_date)

    if len(posts) != 0:
        responces_text = get_responces_from_gpt(current_promt, posts)
        GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt)
    return f'from posts: {len(posts)}' if len(posts) > 0 else 0

@shared_task()
def regenerate_post(long_type, date, project_id, promt_id):
    project = Projects.objects.get(id=project_id)
    current_date = date
    prev_date = current_date - datetime.timedelta(hours=1) if long_type == 1 else current_date - datetime.timedelta(days=1)
    current_promt = Promts.objects.get(id=promt_id)
    posts = get_posts_dict(project, prev_date, current_date)
    instance = None
    if len(posts) != 0:
        responces_text = get_responces_from_gpt(current_promt, posts)
        instance = GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt, date=current_date)
    return instance
