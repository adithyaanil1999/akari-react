import { combineReducers } from 'redux';


function aboutMangaObject(state = {}, action:any) {
    switch (action.type) {
        case 'ADD_ABOUT_MANGA_OBJECT':
            return (action.state)
        default:
            return state;
    }
}

function dashBoardObject(state = {}, action:any) {
    switch (action.type) {
        case 'ADD_DASHBOARD_OBJECT':
            return (action.state)
        default:
            return state;
    }
}

function srcObject(state = {}, action:any) {
    switch (action.type) {
        case 'ADD_SRC_OBJECT':
            return (action.state)
        default:
            return state;
    }
}

function currentSrc(state = '', action:any){
    switch (action.type) {
        case 'CURRENT_SRC':
            return (action.state)
        default:
            return state;
    }
}


function genreObject(state = {}, action:any){
    switch (action.type) {
        case 'ADD_GENRE_OBJECT':
            return (action.state)
        default:
            return state;
    }
}

function genreSearchObject(state = {}, action:any){
    switch (action.type) {
        case 'ADD_GENRE_SEARCH_OBJECT':
            return (action.state)
        default:
            return state;
    }
}

function genreSearchTick(state = 0, action:any){
    switch (action.type) {
        case 'UPDATE_GENRE_SEARCH_SCROLL_TICK':
            return (action.state)
        default:
            return state;
    }
}

function genrePageNo(state = 0, action:any){
    switch (action.type) {
        case 'UPDATE_GENRE_PAGE_NO':
            return (action.state)
        default:
            return state;
    }
}

function selectedGenreArray(state = [], action:any){
    switch (action.type) {
        case 'UPDATE_SELECTED_GENRE':
            return (action.state)
        default:
            return state;
    }
}



function genreSort(state = "default", action:any){
    switch (action.type) {
        case 'UPDATE_GENRE_SORT':
            return (action.state)
        default:
            return state;
    }
}


const rootReducer = combineReducers({
    aboutMangaObject,
    dashBoardObject,
    srcObject,
    currentSrc,
    genreObject,
    genreSort,
    genreSearchObject,
    genreSearchTick,
    genrePageNo,
    selectedGenreArray
});

export default rootReducer