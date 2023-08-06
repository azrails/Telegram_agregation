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
from .models import Sources, Posts, Comments
import datetime
from celery import group
from telethon.errors import SessionPasswordNeededError



api_id = '28410116'
api_hash = '2fc4498ba27db1a3b03576ad81d5440d'
session='anon'

@sync_to_async
def create_post(source_id, post_id, date, post_text):
    try:
        post = Posts.objects.filter(id = (str(source_id) + '@' + str(post_id))).exists()
        if not post:
            new_post = Posts(id=(str(source_id) + '@' + str(post_id)), post_text=post_text, date=date, source_id=Sources.objects.get(id=source_id))
            new_post.save()
    except Exception as e:
        print(f'\n\n {e} \n\n')

@sync_to_async
def create_comment(source_id, post_id, comment_id, comment_text):
    try:
        comment = Comments.objects.filter(id = (str(source_id) + '@' + str(post_id) + '@' + str(comment_id))).exists()
        if not comment:
                new_comment = Comments(id=(str(source_id) + '@' + str(post_id) + '@' + str(comment_id)), comment_text=comment_text)
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
            if post_id:
                await create_post(source_id, post_id, date, post_text)
                try:
                    async for comment in client.iter_messages(channel_url, reply_to=post_id,):
                        comment_id = comment.id
                        comment_text = str(comment.text)
                        if comment_id:
                            await create_comment(source_id, post_id, comment_id, comment_text)
                except Exception as e:
                    pass
    with client:
        client.loop.run_until_complete(task())
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


# @sync_to_async
# def get_post_id(id,temp_message, temp_date, temp_user, temp_image):
#     post = Posts_thewallstreetpro.objects.filter(post_id = id).exists()
#     if post:
#         new_post = None
#     else:
#         new_post= Posts_thewallstreetpro(post_id=id)
#         new_post.post_text=temp_message
#         new_post.date = temp_date
#         new_post.user = temp_user
#         # new_post.image_post = Image(open("20466.jpg", "rb"))
#         # new_post.image_post('20466.jpg"', File().read())
#         if temp_image:
#             new_post.image_post = temp_image
#         new_post.save()
#     return new_post


# @app.task #регистриуем таску
# def thewallstreetpro_parsing():
#     client = TelegramClient('anon', api_id, api_hash)


#     async def main():
#         async for message in client.iter_messages('thewallstreetpro', limit =50):

#             # async for message in client.iter_messages('thewallstreetpro', reply_to=message.id ):
#             #     await comment_append_thewallstreetpro(message.id,message.text)

#             temp_message = str(message.text)
#             temp_date = str(message.date)

#             peer = message.peer_id.channel_id 
#             user = await client.get_entity(peer)
#             temp_user = str(user.username)
            

#             if message.photo is not None:
#                 await message.download_media(f"{message.id}.jpg")
#                 temp_image = f'{message.id}.jpg'
#             else:
#                 temp_image = None
#             new_post = await get_post_id(message.id, temp_message, temp_date, temp_user, temp_image)

#             # async for message in client.iter_messages('thewallstreetpro', reply_to=message.id ):
#             #     await comment_append_thewallstreetpro(message.text,message.id)
          
#     with client:
#         client.loop.run_until_complete(main())

#     return "Канал thewallstreetpro обновлен"



# @sync_to_async
# def comment_append_thewallstreetpro(id,text, post_id):
#     comment = Comments_thewallstreetpro.objects.filter(comment_id = id).exists()
#     if comment:
#         new_comment = None
#     else:
#         new_comment= Comments_thewallstreetpro(comment_id=id)
#         new_comment.comment_text= text    
#         new_comment.post_id = post_id   
#         new_comment.save()
#     return new_comment



# @app.task #регистриуем таску
# def thewallstreetpro_parsing_comment():
#     client = TelegramClient('anon', api_id, api_hash)


#     async def main():
#         async for message in client.iter_messages('thewallstreetpro', limit =50):
#             id_post = message.id
#             async for message in client.iter_messages('thewallstreetpro', reply_to=message.id ):
#                 new_post = await comment_append_thewallstreetpro(message.id, message.text, id_post) 
          
#     with client:
#         client.loop.run_until_complete(main())

#     return "Комментарии канала thewallstreetpro обновлены"



# @sync_to_async
# def mazltov_post(id,temp_message, temp_date, temp_user ):
#     post = mazltov.objects.filter(message_id = id).exists()
#     if post:
#         new_post = None
#     else:
#         new_post= mazltov(message_id=id)
#         new_post.message_text=temp_message
#         new_post.message_date = temp_date
#         new_post.message_user = temp_user
#         # new_post.image_post = Image(open("20466.jpg", "rb"))
#         # new_post.image_post('20466.jpg"', File().read())
#         new_post.save()
#     return new_post


# @app.task #регистриуем таску
# def mazltov_parsing():
#     client = TelegramClient('anon', api_id, api_hash)


#     async def mazltov_main():
#         async for message in client.iter_messages('mazltov', limit =50):
#             temp_message = str(message.text)
#             temp_date = str(message.date)
#             id=message.id
#             peer = message.from_id
#             user = await client.get_entity(peer)
#             temp_user = user.first_name

#             new_post = await  mazltov_post(id,temp_message,temp_date, temp_user)
#     with client:
#         client.loop.run_until_complete(mazltov_main())

#     return "Канал thewallstreetpro обновлен"


# @sync_to_async
# def InteractiveBrokersRUS_post(id,temp_message, temp_date, temp_user ):
#     post = InteractiveBrokersRUS.objects.filter(message_id = id).exists()
#     if post:
#         new_post = None
#     else:
#         new_post= InteractiveBrokersRUS(message_id=id)
#         new_post.message_text=temp_message
#         new_post.message_date = temp_date
#         new_post.message_user = temp_user
#         # new_post.image_post = Image(open("20466.jpg", "rb"))
#         # new_post.image_post('20466.jpg"', File().read())
#         new_post.save()
#     return new_post


# @app.task #регистриуем таску
# def InteractiveBrokersRUS_parsing():
#     client = TelegramClient('anon', api_id, api_hash)


#     async def InteractiveBrokersRUS_main():
#         async for message in client.iter_messages('InteractiveBrokersRUS', limit =50):
#             temp_message = str(message.text)
#             temp_date = str(message.date)
#             id=message.id
#             peer = message.from_id
#             user = await client.get_entity(peer)
#             temp_user = user.first_name

#             new_post = await  InteractiveBrokersRUS_post(id,temp_message,temp_date, temp_user) 
                
          
#     with client:
#         client.loop.run_until_complete(InteractiveBrokersRUS_main())

#     return "Канал InteractiveBrokersRUS обновлен"



# @sync_to_async
# def crossbordertransfers_post(id,temp_message, temp_date, temp_user ):
#     post = InteractiveBrokersRUS.objects.filter(message_id = id).exists()
#     if post:
#         new_post = None
#     else:
#         new_post= crossbordertransfers(message_id=id)
#         new_post.message_text=temp_message
#         new_post.message_date = temp_date
#         new_post.message_user = temp_user
#         # new_post.image_post = Image(open("20466.jpg", "rb"))
#         # new_post.image_post('20466.jpg"', File().read())
#         new_post.save()
#     return new_post


# @app.task #регистриуем таску
# def crossbordertransfers_parsing():
#     client = TelegramClient('anon', api_id, api_hash)


#     async def crossbordertransfers_main():
#         async for message in client.iter_messages('crossbordertransfers', limit =50):
#             temp_message = str(message.text)
#             temp_date = str(message.date)
#             id=message.id
#             peer = message.from_id
#             user = await client.get_entity(peer)
#             temp_user = user.first_name

#             new_post = await  crossbordertransfers_post(id,temp_message,temp_date, temp_user) 
                
          
#     with client:
#         client.loop.run_until_complete(crossbordertransfers_main())

#     return "Канал crossbordertransfers обновлен"


# @sync_to_async
# def LIFEin_ISRAEL_post(id,temp_message, temp_date, temp_user ):
#     post = LIFEin_ISRAEL.objects.filter(message_id = id).exists()
#     if post:
#         new_post = None
#     else:
#         new_post= LIFEin_ISRAEL(message_id=id)
#         new_post.message_text=temp_message
#         new_post.message_date = temp_date
#         new_post.message_user = temp_user
#         new_post.save()
#     return new_post


# @app.task 
# def LIFEin_ISRAEL_parsing():
#     client = TelegramClient('anon', api_id, api_hash)


#     async def LIFEin_ISRAEL_main():
#         async for message in client.iter_messages('LIFEin_ISRAEL', limit =50):
#             temp_message = str(message.text)
#             temp_date = str(message.date)
#             id=message.id
#             peer = message.from_id
#             user = await client.get_entity(peer)
#             temp_user = user.first_name

#             new_post = await  LIFEin_ISRAEL_post(id,temp_message,temp_date, temp_user) 
                
          
#     with client:
#         client.loop.run_until_complete(LIFEin_ISRAEL_main())

#     return "Канал LIFEin_ISRAEL обновлен"