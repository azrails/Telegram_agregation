from django.shortcuts import render
from rest_framework import viewsets
from .models import Projects, Sources, Promts, GptPosts
from .serializers import ProjectsSerializer, SourcesSerializer, PromtSerializer, GptPostsSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
# Create your views here.

class ProjectsViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all()
    serializer_class = ProjectsSerializer

class SourcesViewSet(viewsets.ModelViewSet):
    queryset = Sources.objects.all()
    serializer_class = SourcesSerializer

class PromtsViewSet(viewsets.ModelViewSet):
    queryset = Promts.objects.all()
    serializer_class = PromtSerializer

class GptPostsViewSet(viewsets.ModelViewSet):
    queryset = GptPosts.objects.all()
    serializer_class = GptPostsSerializer

    @action(detail=False, methods=['get'], url_path=r'project_posts/(?P<pk>[0-9]+)')
    def project_posts(self, request, pk=None):
        gpt_posts = GptPosts.objects.filter(project_id=pk)

        page = self.paginate_queryset(gpt_posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(gpt_posts, many=True)
        return Response(serializer.data)