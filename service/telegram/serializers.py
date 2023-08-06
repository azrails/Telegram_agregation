from rest_framework import serializers
from .models import Projects, Sources, Groups

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Groups
        fields = '__all__'

class SourcesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sources
        fields = '__all__'

class ProjectsSerializer(serializers.ModelSerializer):
    sourses = SourcesSerializer(many=True)
    group_id = GroupSerializer(read_only=True)

    class Meta:
        model = Projects
        fields = ['id', 'title', 'description', 'update_time', 'sourses', 'group_id']
    
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