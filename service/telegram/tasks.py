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
from django.utils.timezone import make_aware
import sys
import json
from django.core.serializers.json import DjangoJSONEncoder
import asyncio
from notify_events import Message
import time

sys.setrecursionlimit(10000)

api_id = '21794783'
api_hash = '4d8880bc0cfa9c67838f03c21edcf3f7'
session='anon'
openai.api_key = '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'
GPT_MODEL='gpt-4'
MAX_TOKENS = 4000
NOTIFY_TOKEN='cjc5oad_h4jqmn6eb2-7tmg7j8r7ly4o'

def get_msk_time(time: datetime):
    fmt = "%d-%m-%Y %H:%M"
    timedelta = datetime.timedelta(hours=3)
    return (time + timedelta).strftime(fmt)

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
def create_comment(source_id, post_id, comment_id, comment_text, user_object):
    if len(user_object) != 0:
        try:
            user = TGUser.objects.get(**user_object)
        except Exception as e:
            user = TGUser.objects.create(**user_object)
    try:
        comment = Comments.objects.filter(id = (str(source_id) + '@' + str(post_id) + '@' + str(comment_id))).exists()
        if not comment and comment_text not in ['', ' ', '\n']:
                if len(user_object) != 0:
                    new_comment = Comments(id=(str(source_id) + '@' + str(post_id) + '@' + str(comment_id)), comment_text=comment_text, source_id=Sources.objects.get(id=source_id), user_id=user)
                else:
                    new_comment = Comments(id=(str(source_id) + '@' + str(post_id) + '@' + str(comment_id)), comment_text=comment_text, source_id=Sources.objects.get(id=source_id))
                new_comment.save()
    except Exception as e:
        print(f'\n\n {e} \n\n')


def parse_telegram_chanel(source_id, channel_url: str, offset_date: datetime):
    client = TelegramClient('anon', api_id, api_hash)
    async def task(channel_url):
        if channel_url.isnumeric() or channel_url[1:].isnumeric():
            channel_url = int(channel_url)
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
                if message.reply_to is not None:
                    await create_comment(source_id, message.reply_to.reply_to_msg_id, post_id, post_text, user_object)
                else:
                    await create_post(source_id, post_id, date, post_text, user_object)
    with client:
        client.loop.run_until_complete(task(channel_url))
    return f'chanel: {channel_url} updated'

@app.task
def parse_data():
    sources = Sources.objects.all()
    current_date = datetime.datetime.now(datetime.timezone.utc)
    offset_date = current_date - datetime.timedelta(minutes=30)
    for source in sources:
        if source.type == 'telegram':
            try:
                parse_telegram_chanel(source.id ,source.url, offset_date)
            except Exception as e:
                pass
    return 'Updates complited'


def get_gpt_response(promt_text: str, posts_text) -> str:
    response = openai.ChatCompletion.create(
        model=GPT_MODEL,
        messages = [
            {"role": "system", "content": f'{promt_text}'},
            {"role": "user", "content": f'{posts_text}'},
        ],
        top_p=0.1,
        temperature=0.2
    )
    message = response['choices'][0]['message']['content']
    return message.replace("\n", "<br>")

def comments_tree(comm_id):
    comm_level = Comments.objects.filter(id__icontains=f'@{comm_id}@')
    comments = []
    if len(comm_level) != 0:
        for comm in comm_level:
            coment_id = comm.id.split('@')[2]
            user = 'аноним'
            try:
                user_object = comm.user_id
                if user_object is not None:
                    user = user_object.username
            except Exception as e:
                print(e)
            comments.append({'message_id': coment_id, 'message_text': comm.comment_text ,'username': user})
            comments.extend(comments_tree(coment_id))
    return comments
    

def get_posts_dict(project, prev_hour_date, current_date) -> dict:
    posts = []
    #all posts in sources
    for source in project.sourses.all():
        # print('go gpt')
        posts_l = source.posts.filter(date__range=[prev_hour_date, current_date])
        # no reason create zero posts public key
        if len(posts_l) != 0:
            source_dict = {}
            source_dict["chat_id"] = source.url
            source_dict["chat_name"] = source.title
            source_dict["messages"] = []
            for post in posts_l:
                if  num_tokens_from_string(json.dumps(source_dict, ensure_ascii=False), GPT_MODEL) > MAX_TOKENS // 2:
                    posts.append(source_dict)
                    source_dict = {}
                    source_dict["chat_id"] = source.url
                    source_dict["chat_name"] = source.title
                    source_dict["messages"] = []
                user = 'аноним'
                try:
                    user_object = post.user_id
                    if user_object is not None:
                        user = user_object.username
                except Exception as e:
                    print(e)
                #adding messages for source grouping
                source_dict['messages'].append({'message_id': post.id.split("@")[1], 'message_text': post.post_text, 'username': user})
                comments = Comments.objects.filter(id__icontains=f'@{post.id.split("@")[1]}@')
                if len(comments) != 0:
                    for comm in comments:
                        comm_id = comm.id.split('@')[2]
                        user = 'аноним'
                        try:
                            user_object = comm.user_id
                            if user_object is not None:
                                user = user_object.username
                        except Exception as e:
                            print(e)
                        source_dict["messages"].append({'message_id':comm_id, 'message_text': comm.comment_text, 'username':user,})
                        source_dict["messages"].extend(comments_tree(comm_id))
            posts.append(source_dict)
    return posts

def get_responces_from_gpt(current_promt, posts):
    responces_text = []
    promt_tokens = num_tokens_from_string(current_promt.promt_text, GPT_MODEL)
    i = 0
    end = 0
    count_tokens = promt_tokens
    while i < len(posts):
        count_tokens += num_tokens_from_string(json.dumps(posts[i], ensure_ascii=False), GPT_MODEL)
        if count_tokens >= MAX_TOKENS or i == len(posts) - 1:
            count_tokens = promt_tokens
            responces_text.append(get_gpt_response(current_promt.promt_text, json.dumps(posts[end:i + 1], ensure_ascii=False)))
            end = i + 1
        i+=1
    return responces_text

@app.task
def get_gpt_posts_hour():
    posts = []
    current_time = datetime.datetime.now(datetime.timezone.utc)
    prev_hour_date = current_time - datetime.timedelta(hours=1)
    projects = Projects.objects.all()
    for project in projects:
        if project.update_time == datetime.time(1, 0):
            current_promt = Promts.objects.get(id=project.current_promt)
            posts = get_posts_dict(project, prev_hour_date, current_time)
            if len(posts) != 0:
                responces_text = get_responces_from_gpt(current_promt, posts)
                if len(responces_text) > 1:
                    for i, response_text in enumerate(responces_text):
                        message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})</i><br>Часть {i + 1}<br><br>' + response_text, title=f'{project.title} ({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
                        message.send(NOTIFY_TOKEN)
                else:
                    message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})</i><br><br>' + ' '.join(responces_text), title=f'{project.title} ({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
                    message.send(NOTIFY_TOKEN)
                GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt)
    return posts

@app.task
def get_gpt_posts_day():
    current_time = datetime.datetime.now(datetime.timezone.utc)
    prev_hour_date = current_time - datetime.timedelta(days=1)
    projects = Projects.objects.all()
    posts = []
    for project in projects:
        if project.update_time == datetime.time(0, 0):
            current_promt = Promts.objects.get(id=project.current_promt)
            posts = get_posts_dict(project, prev_hour_date, current_time)
            if len(posts) != 0:
                responces_text = get_responces_from_gpt(current_promt, posts)
                if len(responces_text) > 1:
                    for i, response_text in enumerate(responces_text):
                        message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})</i><br>Часть {i + 1}<br><br>' + response_text, title=f'{project.title} ({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
                        message.send(NOTIFY_TOKEN)
                else:
                    message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})</i><br><br>' + ' '.join(responces_text), title=f'{project.title} ({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
                    message.send(NOTIFY_TOKEN)
                GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt, long_type=datetime.time(0,0))
    return posts

@app.task
def get_gpt_posts_week():
    current_time = datetime.datetime.now(datetime.timezone.utc)
    prev_hour_date = current_time - datetime.timedelta(weeks=1)
    projects = Projects.objects.all()
    posts = []
    for project in projects:
        if project.update_time == datetime.time(2, 0):
            current_promt = Promts.objects.get(id=project.current_promt)
            posts = get_posts_dict(project, prev_hour_date, current_time)
            if len(posts) != 0:
                responces_text = get_responces_from_gpt(current_promt, posts)
                if len(responces_text) > 1:
                    for i, response_text in enumerate(responces_text):
                        message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})</i><br>Часть {i + 1}<br><br>' + response_text, title=f'{project.title} ({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
                        message.send(NOTIFY_TOKEN)
                else:
                    message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})</i><br><br>' + ' '.join(responces_text), title=f'{project.title} ({get_msk_time(current_time)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
                    message.send(NOTIFY_TOKEN)
                GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt, long_type=datetime.time(2,0))
    return posts


@shared_task()
def create_project_update_data(project_id):
    project = Projects.objects.get(id=project_id)
    current_date = datetime.datetime.now(datetime.timezone.utc)
    if project.update_time == datetime.time(1, 0):
        date_timestamp = datetime.timedelta(hours=1)
    elif project.update_time == datetime.time(2, 0):
        date_timestamp = datetime.timedelta(weeks=1)
    else:
        date_timestamp = datetime.timedelta(hours=24)
    prev_hour_date = current_date - date_timestamp
    current_promt = Promts.objects.get(id=project.current_promt)
    for source in project.sourses.all():
        if source.type == 'telegram':
            parse_telegram_chanel(source.id ,source.url, prev_hour_date)
    posts = get_posts_dict(project, prev_hour_date, current_date)

    if len(posts) != 0:
        responces_text = get_responces_from_gpt(current_promt, posts)
        #for notify
        if len(responces_text) > 1:
            for i, response_text in enumerate(responces_text):
                message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_date)} - {get_msk_time(prev_hour_date)})</i><br>Часть {i + 1}<br><br>' + response_text, title=f'{project.title} ({get_msk_time(current_date)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
                message.send(NOTIFY_TOKEN)
        else:
            message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_date)} - {get_msk_time(prev_hour_date)})</i><br><br>' + ' '.join(responces_text), title=f'{project.title} ({get_msk_time(current_date)} - {get_msk_time(prev_hour_date)})', level=Message.LEVEL_VERBOSE)
            message.send(NOTIFY_TOKEN)

        #create gpt_post
        GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt, long_type=project.update_time)
    return json.dumps(
        {'posts': posts, 'project_time': str(project.update_time), 'date_timestamp': str(date_timestamp)},
        sort_keys=True,
        indent=1,
        cls=DjangoJSONEncoder
        )


@shared_task()
def regenerate_post(long_type, date, project_id, promt_id):
    project = Projects.objects.get(id=project_id)
    current_date = make_aware(date)
    prev_date = current_date - datetime.timedelta(hours=1) if long_type == 1 else current_date - datetime.timedelta(weeks=1) if long_type == 2 else current_date - datetime.timedelta(days=1)
    current_promt = Promts.objects.get(id=promt_id)
    posts = get_posts_dict(project, prev_date, current_date)
    instance = None
    if len(posts) != 0:
        with open('results.json', 'w') as f:
            json.dump(posts, f, ensure_ascii=False, indent=2)
        responces_text = get_responces_from_gpt(current_promt, posts)
        if len(responces_text) > 1:
            for i, response_text in enumerate(responces_text):
                message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_date)} - {get_msk_time(prev_date)})</i><br>Часть {i + 1}<br><br>' + response_text, title=f'{project.title} ({get_msk_time(current_date)} - {get_msk_time(prev_date)})', level=Message.LEVEL_VERBOSE)
                message.send(NOTIFY_TOKEN)
        else:
            message = Message(content=f'<b>{project.title}</b><br><i>({get_msk_time(current_date)} - {get_msk_time(prev_date)})</i><br><br>' + ' '.join(responces_text), title=f'{project.title} ({get_msk_time(current_date)} - {get_msk_time(prev_date)})', level=Message.LEVEL_VERBOSE)
            message.send(NOTIFY_TOKEN)
        instance = GptPosts.objects.create(summary=' '.join(responces_text), project_id=project, promt_id=current_promt, date=current_date, 
                                           long_type=datetime.time(1,0) if long_type == 1 else datetime.time(2, 0) if long_type == 2 else datetime.time(0,0))
    return instance


@shared_task()
def get_all_sources():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    client = TelegramClient('anon', api_id, api_hash, loop=loop)
    external_sources = []
    async def get_external_sources():
        all_dialogs = await client.get_dialogs()
        for dialog in all_dialogs:
            if hasattr(dialog.entity, 'title') or (hasattr(dialog.entity, 'username') and dialog.entity.username is not None):
                external_sources.append({'title': (dialog.entity.title if hasattr(dialog.entity, 'title') else dialog.entity.username if hasattr(dialog.entity, 'username') else 'Unknown'), 'url': str(dialog.entity.id)})
    with client:
        client.loop.run_until_complete(get_external_sources())
    return external_sources

@shared_task()
def get_gpt_question(question):
    chunks = []
    tokens = question.split(' ')
    i = 0
    prev = 0
    sum_tokens = 0
    while i < len(tokens):
        print(chunks)
        count_tokens = num_tokens_from_string(tokens[i], GPT_MODEL)
        if sum_tokens + count_tokens <= MAX_TOKENS:
            i+=1
            sum_tokens+=count_tokens
        else:
            chunks.append(get_gpt_response('', ' '.join(tokens[prev: i])))
            sum_tokens = 0
            prev = i
    chunks.append(get_gpt_response('', ' '.join(tokens[prev: i])))
    return ' '.join(chunks)
    