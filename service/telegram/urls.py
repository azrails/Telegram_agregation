from rest_framework import routers

from .views import ProjectsViewSet, SourcesViewSet

router = routers.DefaultRouter()
router.register(r'projects', ProjectsViewSet)
router.register(r'sources', SourcesViewSet)

urlpatterns =[]
urlpatterns += router.urls