from django.shortcuts import render
from rest_framework import viewsets
from .models import Projects, Sources
from .serializers import ProjectsSerializer, SourcesSerializer
# Create your views here.

class ProjectsViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all()
    serializer_class = ProjectsSerializer


class SourcesViewSet(viewsets.ModelViewSet):
    queryset = Sources.objects.all()
    serializer_class = SourcesSerializer