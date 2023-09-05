import { makeAutoObservable, action } from 'mobx'
import $api from '../lib/api'

class Projects {
    projects = []
    page = 1
    count = -1
    state = 'pending'

    constructor() {
        makeAutoObservable(this);
    }

    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }

    fetchProjects() {
        if (this.projects.length !== this.count) {
            this.state = 'pending'
            $api.get(`projects/?page=${this.page}`).then(
                action('fetchProjectsSuccess', response => {
                    this.projects = this.projects.concat(response.data.results);
                    this.count = response.data.count;
                    this.page++;
                    this.state = 'done';
                }),
                action('fetchProjectsError', error => {
                    this.state = 'error'
                })
            )
        }
    }

    deleteProjectById(id) {
        this.count--;
        const position = this.projects.findIndex(e => e.id === id);
        if (position === 0) {
            this.projects = this.projects.slice(1)
        }
        else if (position === this.projects.length - 1) {
            this.projects = this.projects.slice(0, -1)
        }
        else {
            this.projects = [...this.projects.slice(0, position), ...this.projects.slice(position+1, this.projects.length)]
        }
        $api.delete(`projects/${id}/`);
    }

    modifyProjectById(id, content) {
        const { promtDescription, promtText, ...newContent } = content;
        const position = this.projects.findIndex(e => e.id === id)
        const prev_time_value = this.projects[position].update_time
        $api.patch(`promts/${this.projects[position].current_promt}/`, { description: promtDescription, promt_text: promtText })
        $api.put(`projects/${id}/`, newContent).then(action('updateProject', response => {
            this.projects[position] = response.data
            if (this.projects[position].update_time != prev_time_value){
                console.log(this.projects[position].update_time, prev_time_value)
                $api.get(`projects/${this.projects[position].id}/generate_posts`)
            }
        }), action('updatePromtError', error => {
            this.state = 'error'
        }))
    }

    createProject(content) {
        const { promtDescription, promtText, ...newContent } = content;
        $api.post(`projects/`, newContent).then(
            action('createProject', response => {
                this.projects.unshift(response.data);
                $api.post('promts/', { description: promtDescription, promt_text: promtText, project_id: response.data.id }).then(
                    action('createPromt', response => {
                        this.projects[0].current_promt = response.data.id;
                        $api.put(`projects/${this.projects[0].id}/`, this.projects[0]).then(
                            action('postCreatedFull', response => {
                                this.projects[0] = response.data
                                $api.get(`projects/${this.projects[0].id}/generate_posts`)
                            })
                        )
                    }), action('createPromtError', error => {
                        this.state = 'error'
                    })
                )
            }),
            action('createProjectsError', error => {
                this.state = 'error'
            })
        )
    }

    setCurrentPromt(id, promtId) {
        const position = this.projects.findIndex(e => e.id === id);
        this.projects[position].current_promt = promtId;
        $api.put(`projects/${id}/`, this.projects[position])
    }

    createPromt(id, content){
        const position = this.projects.findIndex(e => e.id === id);
        $api.post('promts/', content).then(
            action('createPromt', response => {
                $api.put(`projects/${id}/`, {...this.projects[position], current_promt: response.data.id}).then(
                    action('updatePromt', response => {
                        this.projects[position] = response.data
                    })
                );
            }),
            action('createPromtError', error => {
                this.state = 'error'
            })
        )
    }
}

export default new Projects();