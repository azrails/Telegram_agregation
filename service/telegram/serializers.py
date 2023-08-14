from rest_framework import serializers
from .models import Projects, Sources, Groups, Promts, GptPosts

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Groups
        fields = '__all__'

class SourcesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sources
        fields = ['id', 'title', 'url', 'type', 'projects_list']

class PromtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promts
        fields = ['id', 'description', 'promt_text', 'project_id']

class GptPostsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GptPosts
        fields = '__all__'

class ProjectsSerializer(serializers.ModelSerializer):
    sourses = SourcesSerializer(many=True)
    group_id = GroupSerializer(read_only=True)
    promts = PromtSerializer(many=True, read_only=True)

    class Meta:
        model = Projects
        fields = ['id', 'title', 'description', 'update_time', 'sourses', 'group_id', 'promts', 'current_promt']
    
    def create(self, validated_data):
        sourses = validated_data.pop('sourses')
        project = Projects.objects.create(**validated_data)
        for sourse in sourses:
            s = Sources.objects.get(**sourse)
            project.sourses.add(s.id)
        project.save()
        return project
    
    def update(self, instance, validated_data):
        sourses = validated_data.pop('sourses')
        instance.sourses.clear()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        for sourse in sourses:
            s = Sources.objects.get(**sourse)
            instance.sourses.add(s.id)
        instance.save()
        return instance