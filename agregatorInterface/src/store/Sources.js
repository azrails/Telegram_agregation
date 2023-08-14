import { makeAutoObservable, action } from "mobx";
import $api from "../lib/api";

class Sources {
    sources = [];
    page = 1
    count = -1
    state = 'pending'

    constructor() {
        makeAutoObservable(this);
    }

    getSourceById(id) {
        return this.sources.find(source => source.id === id);
    }

    fetchSoources() {
        if (this.sources.length !== this.count) {
            this.state = 'pending'
            $api.get(`sources/?page=${this.page}`).then(action('fetchSuccess', response => {
                this.sources = this.sources.concat(response.data.results);
                this.count = response.data.count;
                this.page++;
                this.state = 'done';
            }), action('fetchError', error => {
                this.state = 'error'
            }))
        }
    }
    
    modifySourceById(id, content) {
        const position = this.sources.findIndex(e => e.id === id);
        this.sources[position] = content;
        $api.put(`sources/${id}/`, content)
    }

    deleteSourceById(id){
        this.count--;
        const position = this.sources.findIndex(e => e.id === id);
        if (position === 0){
            this.sources = this.sources.slice(1)
        }
        else if (position === this.sources.length - 1){
            this.sources = this.sources.slice(0, -1)   
        }
        else{
            this.sources = [...this.sources.slice(0, position), ...this.sources.slice(position + 1, this.sources.length)] 
        }
        $api.delete(`sources/${id}/`);
    }
}

export default new Sources();