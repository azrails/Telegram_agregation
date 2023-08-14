from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportActionModelAdmin
from import_export.widgets import ForeignKeyWidget, ManyToManyWidget

from .models import Projects, Groups, Sources, Promts, GptPosts, Posts, Comments

class ProjectsResource(resources.ModelResource):
    class Meta:
        model = Projects

class ProjectsAdmin(ImportExportActionModelAdmin):
    resource_class = ProjectsResource
    list_display = ['id', 'title', 'description', 'update_time', 'group_id']

class GroupsResource(resources.ModelResource):
    class Meta:
        model = Groups

class GroupsAdmin(ImportExportActionModelAdmin):
    resource_class = GroupsResource
    list_display = ['id', 'title']

class SourcesResource(resources.ModelResource):
    class Meta:
        model = Sources

class SourcesAdmin(ImportExportActionModelAdmin):
    resource_class = SourcesResource
    list_display = ['id', 'url', 'type']

class PromtsResource(resources.ModelResource):
    class Meta:
        model = Promts

class PromtsAdmin(ImportExportActionModelAdmin):
    resource_class = PromtsResource
    list_display = ['id', 'description', 'promt_text', 'project_id']

class GptPostsResource(resources.ModelResource):
    class Meta:
        model = GptPosts

class GptPostsAdmin(ImportExportActionModelAdmin):
    resource_class = GptPostsResource
    list_display = [field.name for field in GptPosts._meta.get_fields()]

class PostsResource(resources.ModelResource):
    class Meta:
        model = Posts

class PostsAdmin(ImportExportActionModelAdmin):
    resource_class = PostsResource
    list_display = [field.name for field in Posts._meta.get_fields()]

class CommentsResource(resources.ModelResource):
    class Meta:
        model = Comments

class CommentsAdmin(ImportExportActionModelAdmin):
    resource_class = CommentsResource
    list_display = [field.name for field in Comments._meta.get_fields()]

admin.site.register(Projects, ProjectsAdmin)
admin.site.register(Groups, GroupsAdmin)
admin.site.register(Sources, SourcesAdmin)
admin.site.register(Promts, PromtsAdmin)
admin.site.register(GptPosts, GptPostsAdmin)
admin.site.register(Posts, PostsAdmin)
admin.site.register(Comments, CommentsAdmin)