from rest_framework import routers

from .views import ProjectsViewSet, SourcesViewSet, PromtsViewSet, GptPostsViewSet, GptChatApiView
from django.urls import path

router = routers.DefaultRouter()
router.register(r'projects', ProjectsViewSet)
router.register(r'sources', SourcesViewSet)
router.register(r'promts', PromtsViewSet)
router.register(r'gpt_posts', GptPostsViewSet)

urlpatterns = [path(r'gpt_chat/', GptChatApiView.as_view())]
urlpatterns += router.urls