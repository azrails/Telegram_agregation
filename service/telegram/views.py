from django.shortcuts import render
from rest_framework import viewsets
from .models import Projects, Sources, Promts, GptPosts
from .serializers import ProjectsSerializer, SourcesSerializer, PromtSerializer, GptPostsSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from telegram.tasks import create_project_update_data
from rest_framework import status
import datetime
from telegram.tasks import regenerate_post, get_all_sources, get_gpt_question
from rest_framework.views import APIView
# Create your views here.

class ProjectsViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all()
    serializer_class = ProjectsSerializer

    @action(detail=True, methods=['get'])
    def generate_posts(self, request, pk=None):
        create_project_update_data.delay(pk)
        return Response({}, status=status.HTTP_202_ACCEPTED)


class SourcesViewSet(viewsets.ModelViewSet):
    queryset = Sources.objects.all()
    serializer_class = SourcesSerializer

    @action(detail=False, methods=['get'])
    def extra_sources(self, request):
        data = get_all_sources()
        return Response(data)
    @action(detail=False, methods=['get'])
    def all_sources(self, request):
        data = Sources.objects.all()
        serializer = self.get_serializer(data=data, many=True)
        return Response(serializer.data)

class PromtsViewSet(viewsets.ModelViewSet):
    queryset = Promts.objects.all()
    serializer_class = PromtSerializer

class GptPostsViewSet(viewsets.ModelViewSet):
    queryset = GptPosts.objects.all()
    serializer_class = GptPostsSerializer

    @action(detail=True, methods=['post'], url_name=r'generate_posts/(?P<pk>[0-9]+)')
    def generate_posts(self, request, pk=None):
        project_id = request.data.pop('project_id')
        long_type = request.data.pop('long_type')
        date = request.data.pop('date')
        promt_id = request.data.pop('promt_id')
        instance = regenerate_post(datetime.datetime.strptime(long_type, '%H:%M:%S').hour, datetime.datetime.fromtimestamp(date/1000.0), project_id, promt_id)
        if instance == None:
            return Response({})
        return Response(self.get_serializer(instance).data)

    @action(detail=False, methods=['get'], url_path=r'project_posts/(?P<pk>[0-9]+)')
    def project_posts(self, request, pk=None):
        gpt_posts = GptPosts.objects.filter(project_id=pk)
        page = self.paginate_queryset(gpt_posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(gpt_posts, many=True)
        return Response(serializer.data)

class GptChatApiView(APIView):
    def post(self, request):
        question = request.data.pop('value')
        answer = get_gpt_question(question)
        return Response({'value': answer})