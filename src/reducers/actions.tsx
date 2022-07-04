export function action_add_about_manga_object(aboutMangaObj:any) {
    return {
        type: 'ADD_ABOUT_MANGA_OBJECT',
        state: aboutMangaObj
    }
}

export function action_add_dashboard_object(aboutMangaObj:any) {
    return {
        type: 'ADD_DASHBOARD_OBJECT',
        state: aboutMangaObj
    }
}

export function action_add_src_object(srcObj:any) {
    return {
        type: 'ADD_SRC_OBJECT',
        state: srcObj
    }
}

export function action_current_src(src:string) {
    return {
        type: 'CURRENT_SRC',
        state: src
    }
}

export function action_add_genre_object(genreObj:any) {
    return {
        type: 'ADD_GENRE_OBJECT',
        state: genreObj
    }
}

export function action_add_genre_search_object(genreSearchObj:any) {
    return {
        type: 'ADD_GENRE_SEARCH_OBJECT',
        state: genreSearchObj
    }
}

export function action_update_genre_search_scroll_tick(scrollTick:number) {
    return {
        type: 'UPDATE_GENRE_SEARCH_SCROLL_TICK',
        state: scrollTick
    }
}

export function action_update_genre_page_no(pageNo:number) {
    return {
        type: 'UPDATE_GENRE_PAGE_NO',
        state: pageNo
    }
}

export function action_update_selected_genre(selectGenre:any) {
    return {
        type: 'UPDATE_SELECTED_GENRE',
        state: selectGenre
    }
}

export function action_update_genre_sort(sort:string) {
    return {
        type: 'UPDATE_GENRE_SORT',
        state: sort
    }
}