from rest_framework import routers

from .views import ProjectsViewSet, SourcesViewSet, PromtsViewSet, GptPostsViewSet

router = routers.DefaultRouter()
router.register(r'projects', ProjectsViewSet)
router.register(r'sources', SourcesViewSet)
router.register(r'promts', PromtsViewSet)
router.register(r'gpt_posts', GptPostsViewSet)

urlpatterns =[]
urlpatterns += router.urls