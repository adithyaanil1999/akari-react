import React, { FunctionComponent,useRef,useEffect,useState } from 'react';
import './settings.css';
import {backendUrl}  from '../../global';
import { store } from '../../index';
import { connect } from 'react-redux';
import { action_update_genre_sort, action_add_genre_search_object, action_add_about_manga_object, action_update_genre_page_no, action_update_genre_search_scroll_tick, action_update_selected_genre, action_add_dashboard_object, action_current_src, action_add_genre_object } from '../../reducers/actions';

interface SettingsProps {
    verifyTokens: ()=> Promise<void> ;
    getColors: any;
} 
const SettingsComponent: FunctionComponent<SettingsProps> = (props:any) =>{

    let [isLoggingOut,toggleIsLoggingOut] = useState<React.SetStateAction<boolean>>(false);
    let [isLoading,toggleIsLoading] = useState<React.SetStateAction<boolean>>(false);


    const handleLogout = async(event: React.MouseEvent<HTMLButtonElement>) =>{
        event.stopPropagation();
        toggleIsLoggingOut(true);
        if(isLoggingOut === false){
            const resp = await fetch(backendUrl+"logout",{
                method: 'GET',
                credentials: 'include',
                headers:{
                    'Content-type': 'application/json'
                },
            });

            if(resp){
                toggleIsLoggingOut(true);
                props.verifyTokens(); 
            }
        }
    }
    const handleSrcChange = async(event: React.MouseEvent<HTMLDivElement>,src:any)=>{
        event.stopPropagation();
        toggleIsLoading(true);
        const response = await fetch(backendUrl+'changeSrc',{
            method: 'POST',
            credentials:'include',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                src:src
            })
        })
        if(response.ok){
            toggleIsLoading(false);
            //clear store
            store.dispatch(action_add_genre_search_object({}));
            store.dispatch(action_update_genre_page_no(0));
            store.dispatch(action_add_genre_search_object({}))
            store.dispatch(action_add_genre_object({}))
            store.dispatch(action_update_genre_search_scroll_tick(0));
            store.dispatch(action_update_selected_genre([]));
            store.dispatch(action_update_genre_sort("default"));
            store.dispatch(action_add_dashboard_object({}))
            store.dispatch(action_current_src(src))
        }
    }

    useEffect(()=> {
       
    })

    return(
        
        isLoading?
            <div className="settings-loader-wrap">
                <div className="lds-roller">
                    <div>
                    </div>
                    <div>
                    </div>
                    <div>
                    </div>
                    <div>
                    </div>
                    <div>
                    </div>
                    <div>
                    </div>
                    <div>
                    </div>
                    <div>  
                    </div>
                </div>
            </div>:
        <div className="settings-wrap">
            <div style={{color: props.getColors.accentColor}} className="settings-header-wrap">
                <h1>Settings</h1>
            </div>
            <div className="settings-body-wrap">
                <div className="setting-body">
                    <div style={{background:props.getColors.secondaryBgColor ,color: props.getColors.accentColor}} className="settings-item-wrap">
                        <div className="settings-item-header-wrap">
                            <span>Source</span>
                        </div>
                        <div style={{background:props.getColors.highLightBgColor,color: props.getColors.highLightAccentColor}} className="settings-item-body">
                            {
                                Object.keys(props.srcObject).length !== 0 ?
                                Object.keys(props.srcObject).map((item:any,index:any)=>{
                                    return <div onClick={(e)=>handleSrcChange(e,item)} key={index} className="settings-source-item-wrap">
                                        <span>[{props.srcObject[item].type === "manga"?"MANGA":"COMIC"}] {props.srcObject[item].name}</span>
                                        {
                                            item === props.currentSrc?
                                            <span className="material-symbols-outlined">
                                            check
                                            </span>:null
                                        }
                                    </div>
                                }):null
                            }
                        </div>
                    </div>
                    
                </div>
                <div className="logout-wrap">
                    <button onClick={handleLogout} className="logoutBtn">
                        <span className="logoutSpan">Logout</span>
                        <div className="logoutBtnSpinner">
                        { isLoggingOut ? 
                            <div className="spinner">
                                <div className="double-bounce1"></div>
                                <div className="double-bounce2"></div>
                            </div>
                            :
                            <span className="material-icons">arrow_forward</span>
                        }
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

function mapStateToProps(state:any) {
    return state;
}


export default connect(mapStateToProps)(SettingsComponent);