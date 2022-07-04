import React, { FunctionComponent,useRef,useEffect,useState } from 'react';
import {scaperUrl} from '../../global';
import './dashboard.css';
import { action_add_dashboard_object } from '../../reducers/actions';
import { store } from '../../index';
import { connect } from 'react-redux';

interface DashbordProps {
    getColors: any;
    openAboutPage: (url:string) => void
} 


const DashboardComponent: FunctionComponent<DashbordProps> = (props:any) =>{

    const searchInp = useRef<HTMLInputElement>(null);
    const searchBar = useRef<HTMLDivElement>(null);
    const searchBody = useRef<HTMLDivElement>(null);
    const featuredThumb = useRef<HTMLDivElement>(null);
    const dashWarp = useRef<HTMLDivElement>(null);
    const featuredWarp = useRef<HTMLDivElement>(null);


    let [isSearchOpen,toggleSearchOpen] = useState<React.SetStateAction<boolean>>(false);
    let [isDashboardLoading,toggleDashboardLoader] = useState<React.SetStateAction<boolean>>(true);
    let [dashboardItems, dashboardItemsLoader] = useState<React.SetStateAction<any>>({});
    let [isSearchBodyOpen, toggleSearchBodyOpen] = useState<React.SetStateAction<boolean>>(false);
    let [isSearchResultsLoaded, toggleSearchResultsLoaded] = useState<React.SetStateAction<boolean>>(false);
    let [searchItems, setSearchItems] = useState<React.SetStateAction<any>>([]);
    

    let searchTimer:any = false;
    

    const handleSearchFocus = (option:boolean) =>{
        // Changes the width of the search bar
        if(option){
            if(searchBar.current){
                searchBar.current.classList.add('isFocused');
            }
        }else{
            if(searchBar.current){
                searchBar.current.classList.remove('isFocused');
            }
        }
       
    }

    const handleOpenSearch = () =>{
        if(isSearchOpen === true){
            if(searchBody.current){
                searchBody.current.style.display = 'flex';
                searchBody.current.classList.add('slideDownSearch');
            }
        }
    }

    const closeSearch = () =>{
        const searchAnimationFunction = () =>{
            if(searchBody.current && isSearchOpen === true){
                searchBody.current.style.display = 'none';
                searchBody.current.classList.remove('slideUpSearch');
                handleSearchFocus(false);
                toggleSearchOpen(false);
                toggleSearchResultsLoaded(false);
                searchBody.current.removeEventListener('animationend',searchAnimationFunction);
            } 
        }
        if(searchBody.current && isSearchOpen === true){
            searchBody.current.classList.remove('slideDownSearch');
            searchBody.current.classList.add('slideUpSearch');
            searchBody.current.addEventListener('animationend',searchAnimationFunction)

        }
    }

    const getSearchDetails = async(title:string,maxItems = 1) =>{
        // get search items

        const response = await fetch(scaperUrl+'search',{
            method: 'POST',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'title': title,
                'maxItems': maxItems,
                'type': 'manga'
            })
        });

        if(response.ok){
            const jsonResp = await response.json();
            if(jsonResp){
                // get sources and adjust height to max
                const maxHeight = 80;
                let srcNo = 0;
                let srcArr:Array<any> = [];
                

                jsonResp.searchArray.forEach((element:any) => {
                    if(srcArr.includes(element.src) === false){
                        srcArr.push(element.src);
                        srcNo++;
                    }
                });

                const height =  srcNo === 0? "26" :srcNo*5 >= 80 ? "80": String(srcNo*30);
                console.log(jsonResp.searchArray)
                searchBody.current?searchBody.current.style.height = height+ `vh`: null;
                setSearchItems(jsonResp.searchArray);
                toggleSearchResultsLoaded(true)
            }
        }
        
    }

    const handleSearchInp = (e:React.KeyboardEvent) =>{
       
        if(searchInp.current && searchBody.current){
            const val = searchInp.current.value;
            if(e.key === 'Enter'){
                
                searchInp.current.blur();
                //extend search
                searchBody.current.style.height = '80vh';
                searchBody.current.style.transition = 'height 0.5s';
                toggleSearchBodyOpen(true);
                getSearchDetails(val,20);
                // toggleSearchSpinner
            }else{
                searchBody.current.style.height = '5vh';
                toggleSearchBodyOpen(false);
                
            }
            if(val.length > 0){
                handleSearchFocus(true);
                toggleSearchOpen(true);
            }else{
                //close search body
                searchInp.current.blur();
                toggleSearchBodyOpen(false);
                closeSearch();
            }
        }
    }

    const getDashBoardItems = async () =>{
        // POST CALL FOR dashboard items


        const response = await fetch(scaperUrl+'dashboardItems',{
            method: 'POST',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'src': props.currentSrc,
                'skipChapterBool': true
            })
        });

        if(response.ok){
            const jsonResp = await response.json();
            if(jsonResp){
                toggleDashboardLoader(false);
                dashboardItemsLoader(jsonResp);
                store.dispatch(action_add_dashboard_object(jsonResp));
                setTimeout(()=>{
                    if(featuredThumb.current){
                        featuredThumb.current.style.backgroundImage=`linear-gradient(rgb(94 94 94 / 14%), rgb(28 28 28 / 74%)),url(${jsonResp.featuredItemInfo.thumb})`
                    }
                },10)
            }
        }


    };

    const setColors = (colorObj:any) =>{
        // sets color scheme
        if(dashWarp.current && searchBar.current && featuredWarp.current && searchBody.current){
            dashWarp.current.style.color = colorObj.accentColor;
            searchBar.current.style.background = colorObj.secondaryBgColor;
            searchBody.current.style.background = colorObj.secondaryBgColor;
            featuredWarp.current.style.background = colorObj.secondaryBgColor;
        }
    }

    useEffect(()=> {
        
        setColors(props.getColors);
        if(isDashboardLoading === true && props.currentSrc.length !==0){
            if(Object.keys(props.dashBoardObject).length !== 0){
                dashboardItemsLoader(props.dashBoardObject);
                toggleDashboardLoader(false);
                setTimeout(()=>{
                    if(featuredThumb.current){
                        featuredThumb.current.style.backgroundImage=`linear-gradient(rgb(94 94 94 / 14%), rgb(28 28 28 / 74%)),url(${props.dashBoardObject.featuredItemInfo.thumb})`
                    }
                },10)
            }else{
                getDashBoardItems();
            }
        }
    });

    

    return(
        <div ref={dashWarp} className="dashboard-wrap">
            {isSearchOpen? <div className="dash-blur"/>:null}
            <div className="search-wrap">
                <div  onTransitionEnd={handleOpenSearch} ref={searchBar} className="search-bar">
                    <div className="search-icon-wrap">
                        <span className="material-symbols-outlined">
                            search
                        </span>
                    </div>
                    <div className="search-input-wrap ">
                        <input  ref={searchInp} onKeyUp={(e)=>handleSearchInp(e)} type="text" placeholder="Search" className="search-input"/>
                    </div>
                </div>
                <div ref={searchBody} className="search-body">
                    <div style={{display:`${isSearchBodyOpen?'flex':'None'}`}} className="search-body-inner-wrap">
                        <div style={{display:`${isSearchResultsLoaded?'None':'flex'}`}} className="search-loader-wrap">
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
                        </div>
                        <div style={{display:`${isSearchResultsLoaded?'flex':'None'}`}} className="search-items-wrap">
                            {
                                searchItems.length !== 0 ?
                                Object.keys(props.srcObject).map((e:any,i:number)=>{
                                    console.log(e)
                                    return  <div key={i} className="search-items-row-wrap">
                                                <div className="searchItem-header-wrap">
                                                    <span>{props.srcObject[e].name}</span>
                                                </div>
                                                <div className="search-carousel-wrap">
                                                    
                                                {
                                                    searchItems.map((k:any,j:number)=>{
                                                        
                                                        if(k.src === e){
                                                            return <div key={j} className="search-item-wrap">
                                                                <div onClick={()=>props.openAboutPage(k.link)} style={{background:`linear-gradient(rgba(94, 94, 94, 0.14), rgba(4, 4, 4, 0.96)),url(${k.thumb})`}} className="search-thumb-wrap">
                                                                    <span>{k.title.length<30?k.title:k.title.slice(0,30)+"..."}</span>
                                                                </div>
                                                            </div>
                                                        }
                                                    })
                                                }
                                                </div>
                                            </div> 
                                    })
                                :
                                <div className="search-empty">
                                    <h3>We found nothing matching the title!</h3>
                                </div>
                            }
                        </div>
                    </div>
                    <div style={{display:`${isSearchBodyOpen?'flex':'None'}`}} className="search-bottom-menu-wrap">
                        <button onClick={()=>{
                            if( searchInp.current && searchBody.current ){
                                searchBody.current.style.height = '5vh';
                                searchInp.current.value = '';
                                searchInp.current.blur();
                                toggleSearchBodyOpen(false);
                                setTimeout(()=>closeSearch(),500);
                            }
                            }}style={{color:props.getColors.accentColor,background:props.getColors.highLightBgColor}} className="close-search">
                            <span>
                                Close
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="dashboard-inner-wrap">
                <p className="dashboard-header">Featured</p>
                <div ref={featuredWarp} className="featured-wrap">
                    {
                        isDashboardLoading ?
                            <div className="dash-loader-wrap">
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
                            </div>
                            :
                        <div className="featured-item">
                            <div className="featured-thumb-wrap">
                                <div ref={featuredThumb} className="featured-thumb"/>
                            </div>
                            <div className="featured-content-wrap">
                                <p className="feature-title">{dashboardItems.featuredItemInfo.title}</p>
                                <p className="feature-desc">{dashboardItems.featuredItemInfo.desc}</p>
                                <button onClick={()=>props.openAboutPage(dashboardItems.featuredItemInfo.link)} className="featured-btn">Read Now</button>
                                <div className="featured-bottom-margin"/>
                            </div>
                        </div>
                    }
                </div>
                <p className="dashboard-header">Trending</p>
                <div className="carousel-wrap">
                    {
                    isDashboardLoading ?
                    <div className="dash-loader-wrap">
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
                        </div>
                    :
                    <div className="carousel-inner-wrap">
                        {
                            dashboardItems.TrendingItems.map((item:any,index:any)=>{
                                return <div onClick={()=>props.openAboutPage(item.link)} key={index} className="carousel-items">
                                    <div style={{background:`url(${item.thumb})`}} className="carousel-thumb"/>
                                    <div className="carousel-title">{
                                       item.title.length < 30 ? item.title:
                                       item.title.slice(0,30) + ".."
                                    }
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    }
                </div>
                <p className="dashboard-header">New Updates</p>
                <div className="carousel-wrap">
                    {
                    isDashboardLoading ?
                    <div className="dash-loader-wrap">
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
                        </div>
                    :
                    <div className="carousel-inner-wrap">
                        {
                            dashboardItems.newUpdates.map((item:any,index:any)=>{
                                return <div onClick={()=>props.openAboutPage(item.link)} key={index} className="carousel-items">
                                    <div style={{background:`url(${item.thumb})`}} className="carousel-thumb"/>
                                    <div className="carousel-title">{
                                       item.title.length < 30 ? item.title:
                                       item.title.slice(0,30) + ".."
                                    }
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    }
                </div>
                <p className="dashboard-header">Popular</p>
                <div className="carousel-wrap">
                    {
                    isDashboardLoading ?
                    <div className="dash-loader-wrap">
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
                        </div>
                    :
                    <div className="carousel-inner-wrap">
                        {
                            dashboardItems.popularItems.map((item:any,index:any)=>{
                                return <div onClick={()=>props.openAboutPage(item.link)} key={index} className="carousel-items">
                                    <div style={{background:`url(${item.thumb})`}} className="carousel-thumb"/>
                                    <div className="carousel-title">{
                                       item.title.length < 30 ? item.title:
                                       item.title.slice(0,30) + ".."
                                    }
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    }
                </div>
                <div className="dashboard-bottom-margin"/>
            </div>
        </div>
    )
}

function mapStateToProps(state:any) {
    return state;
}

export default  connect(mapStateToProps)(DashboardComponent);