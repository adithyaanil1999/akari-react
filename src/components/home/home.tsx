import React, { useReducer,FunctionComponent,useRef,useEffect,useState} from 'react';
import { Link, Outlet } from 'react-router-dom';
import './home.css';
import { store } from '../../index';
import { connect } from 'react-redux';
import { action_update_genre_sort, action_add_genre_search_object, action_add_about_manga_object, action_update_genre_page_no, action_update_genre_search_scroll_tick, action_update_selected_genre } from '../../reducers/actions';



interface HomeProps {
    verifyTokens: ()=> Promise<void> ;
    isLoginVerified: React.SetStateAction<boolean>;
    getColors: any;
} 

const HomeComponent: FunctionComponent<HomeProps> = (props:any) => {

    const isMobile = require('is-mobile');
    const homeWrap = useRef<HTMLDivElement>(null);
    const navMobile = useRef<HTMLDivElement>(null);

    let [posi, setposi] = useState<React.SetStateAction<number>>(3);

    const handleNav = (event: React.MouseEvent<HTMLAnchorElement>,position:number) => {
        // function handling nav item hightlighting and navigation
        event.stopPropagation();
        setposi(position);
        // reset genre search Obj
        store.dispatch(action_add_genre_search_object({}));
        store.dispatch(action_update_genre_page_no(0));
        store.dispatch(action_update_genre_search_scroll_tick(0));
        store.dispatch(action_update_selected_genre([]));
        store.dispatch(action_update_genre_sort("default"));


    }

    const clearStoreAboutManga = () =>{
        //clears redux store for about manga
        let currentLoc = location.pathname;
        if(currentLoc.includes('dashboard') || currentLoc.includes('history') || currentLoc.includes('genre') || currentLoc.includes('bookmarks'))
            store.dispatch(action_add_about_manga_object({}));
    }

    const preventDefaultNav = () =>{
        if(homeWrap.current){
            homeWrap.current.addEventListener('touchstart',(e: MouseEvent|TouchEvent)=>{
                if (e instanceof MouseEvent) {
                    if (e.pageX > 30 && e.pageX < window.innerWidth - 30) return;
                }else{
                    let touch = e.targetTouches[0]
                    if(touch.pageX > 30 && touch.pageX < window.innerWidth - 30) return;
                }
                // prevent swipe to navigate back gesture
                e.preventDefault();
            });
        }
    }

    const getCurrentNavItemFromLocation = ()=>{
        let currentLoc = location.pathname;
        if(currentLoc.includes('bookmarks')){
            setposi(1);
        }else if(currentLoc.includes('history')){
            setposi(2);
        }else if(currentLoc.includes('dashboard')){
            setposi(3);
        }else if(currentLoc.includes('genre')){
            setposi(4);
        }else if(currentLoc.includes('settings')){
            setposi(5);
        }
    }

    const applyColors = (colorObj:any) =>{
        if(homeWrap.current && navMobile.current){
            homeWrap.current.style.background = colorObj.bgColor;
            navMobile.current.style.background = colorObj.secondaryBgColor;
        }
    }

    useEffect(()=>{
        if(Object.keys(props.aboutMangaObject).length !== 0){
            clearStoreAboutManga();
        }
        applyColors(props.getColors);
        preventDefaultNav();
        getCurrentNavItemFromLocation();
    })
    return (
        <div ref={homeWrap} className="home-component-wrap">
            <div className="home-container">
                <Outlet/>
            </div>
            {
                 
                <div ref={navMobile} className="nav-bar-mobile">
                    <Link to="/home/bookmarks" style={{color : `${posi === 1 ? props.getColors.highLightAccentColor: props.getColors.accentColor}` }}  onClick = { (e) => handleNav(e,1)} className="nav-item">
                        <span className="material-symbols-outlined nav-icon">
                            book
                        </span>
                        <span className="nav-title">Libary</span>
                    </Link>
                    <Link to="/home/history" style={{color : `${posi === 2 ? props.getColors.highLightAccentColor: props.getColors.accentColor}` }}  onClick = { (e) => handleNav(e,2)} className="nav-item">
                        <span className="material-symbols-outlined nav-icon">
                            history
                        </span>
                        <span className="nav-title">History</span>
                    </Link>
                    <Link to="/home/dashboard" style={{color : `${posi === 3 ? props.getColors.highLightAccentColor: props.getColors.accentColor}` }}   onClick = { (e) => handleNav(e,3)} className="nav-item">
                        <span className="material-symbols-outlined nav-icon">
                            dashboard
                        </span>
                        <span className="nav-title">Dashboard</span>
                    </Link>
                    <Link to="/home/genre" style={{color : `${posi === 4 ? props.getColors.highLightAccentColor: props.getColors.accentColor}` }}  onClick = { (e) => handleNav(e,4)} className="nav-item">
                        <span className="material-symbols-outlined nav-icon">
                            filter_alt
                        </span>
                        <span className="nav-title">Genre</span>
                    </Link>
                    <Link to="/home/settings" style={{color : `${posi === 5 ? props.getColors.highLightAccentColor: props.getColors.accentColor}` }}  onClick = { (e) => handleNav(e,5)} className="nav-item">
                        <span className="material-symbols-outlined">
                            settings
                        </span>
                        <span className="nav-title">Settings</span>
                        {
                            isMobile()?null:
                            <div className="nav-bottom-spacer"/>
                        }
                    </Link>
                </div>
                
            }
        </div>
    );
}

function mapStateToProps(state:any) {
    return state;
}


export default connect(mapStateToProps)(HomeComponent);