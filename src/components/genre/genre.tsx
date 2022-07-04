import {scaperUrl} from '../../global';
import React, { FunctionComponent,useRef,useEffect,useState } from 'react';
import { store } from '../../index';
import { connect } from 'react-redux';
import { action_update_selected_genre, action_update_genre_page_no, action_add_genre_object,action_add_genre_search_object,action_update_genre_search_scroll_tick, action_update_genre_sort } from '../../reducers/actions';
import './genre.css'

interface GenreProps {
    getColors: any;
    openAboutPage: (url:string) => void;
}  

const GenreComponent: FunctionComponent <GenreProps> = (props:any) =>{

    let [GenreHeader, setGenreHeader] = useState<React.SetStateAction<string>>('Genres');
    let [isGenreObjectLoaded,toggleGenreObjectLoaded] = useState<React.SetStateAction<boolean>>(false);
    let [genreObject,setGenreObject] = useState<React.SetStateAction<any>>({});
    let [genreSearchObject,setGenreSearchObject] = useState<React.SetStateAction<any>>({});
    let [showSpinner,toggleSpinner] = useState<React.SetStateAction<boolean>>(true);
    let [isGenreSearchObjectSet,toggleGenreSearchObject] = useState<React.SetStateAction<boolean>>(false);
    let [selectedGenreArray,setSelectedGenreArr] = useState<React.SetStateAction<any>>([]);
    let [isGenreLoadMoreFalse,toggleGenreLoadMore] = useState<React.SetStateAction<boolean>>(false);
    let [prevScrollTick,setPrevScrollTick] = useState<React.SetStateAction<number>>(-1);
    let [lastLoadScrollTick,setLastLoadScrollTick] = useState<React.SetStateAction<number>>(-1);
    let [currentPageNo,setCurrentPageNo] = useState<React.SetStateAction<number>>(1);
    let [stopLoad,toggleStopLoad] = useState<React.SetStateAction<boolean>>(false);
    let [genreSort,setGenreSort] = useState<React.SetStateAction<string>>("default");


    const searchBody = useRef<HTMLDivElement>(null);
    const sortOption = useRef<HTMLSelectElement>(null);


    const getGenreObject = async() =>{
        const response = await fetch(scaperUrl+'getGenres',{
            method: 'POST',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'src': props.currentSrc,
            })
        });

        if(response.ok){
            const jsonResp = await response.json()
            if(jsonResp){
                store.dispatch(action_add_genre_object(jsonResp.genreList))
                setGenreObject(jsonResp.genreList);
                toggleSpinner(false);
            }
        }
    }

    const addToSelectGenre = (e:React.TouchEvent|React.MouseEvent,title:string,link:string) =>{
        e.stopPropagation();
        // adds to selected genre array
        const simpleSelect  = props.srcObject[props.currentSrc].simpleGenreSelect; 
        if(simpleSelect === false || simpleSelect === undefined){
            let tempArr = [...selectedGenreArray];
            let isTitleFoundFlag = false;
            tempArr = tempArr.filter((e:any) => {
                if(e.title === title){
                    isTitleFoundFlag = true
                    if(e.include === true){
                        e.include = false;
                        return true
                    }else if(e.include === false){
                        return false
                    }
                }else{
                    return true;
                }
            });
            isTitleFoundFlag ?tempArr: tempArr.push({title:title,include:true,link:link})
            setSelectedGenreArr(tempArr);
            store.dispatch(action_update_selected_genre(tempArr))

        }else{
            // source cannot select more than 1 tag
            setSelectedGenreArr([{title:title,include:true,link:link}]);
            store.dispatch(action_update_selected_genre([{title:title,include:true,link:link}]))

        }
       
    }

    const removeItemfromGenreArr = (e:React.TouchEvent|React.MouseEvent,title:string) =>{
        e.stopPropagation();
        let tempArr = [...selectedGenreArray];
        tempArr = tempArr.filter((e:any) => {
            if(e.title === title){
                return false;
            }else{
                return true;
            }
        });
        setSelectedGenreArr(tempArr);
    }

    const handleGenreSearch = async(e:React.TouchEvent|React.MouseEvent|null,pageNo = 1)=>{
        if(e !== null){
            e.stopPropagation();
        }
        if(pageNo == 1){
            toggleSpinner(true);
        }
        const response = await fetch(scaperUrl+'genreManga',{
            method: 'POST',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'src': props.currentSrc,
                'page': pageNo,
                'genreArray': selectedGenreArray,
                'sort' : genreSort
            })
        });

        if(response.ok){
            const jsonResp = await response.json()
            if(jsonResp){
                toggleGenreLoadMore(false)
                if(pageNo == 1){
                    console.log(jsonResp)
                    store.dispatch(action_add_genre_search_object(jsonResp.result));
                    setGenreSearchObject(jsonResp.result);
                    toggleGenreSearchObject(true);
                    toggleSpinner(false);
                }else{
                    
                    if(jsonResp.result.resultList !== "END"){
                        let temp = genreSearchObject
                        temp.resultList = temp.resultList.concat(jsonResp.result.resultList);
                        store.dispatch(action_add_genre_search_object(temp));
                        setGenreSearchObject(temp);
                        
                    }else{
                        store.dispatch(action_update_genre_page_no(pageNo-1))
                        toggleStopLoad(true)
                    }
                    
                    
                        
                    
                }
            }
        }


    }

    const checkGenreInArr = (title:string)=>{
        let isTitleFoundFlag = false;
        let selectedType;
        selectedGenreArray.forEach((e:any)=>{
            if(e.title === title){
                isTitleFoundFlag = true;
                selectedType = e.include;
            }
        })
        if(isTitleFoundFlag)
            return [true,selectedType]
        else
            return false
    }

    const handleGenreScroll = (e: React.UIEvent<HTMLDivElement>) =>{
        const div = e.target as HTMLDivElement;
        let target = Math.floor((div.scrollHeight - div.clientHeight -1))
        store.dispatch(action_update_genre_search_scroll_tick(div.scrollTop))
        if(prevScrollTick < div.scrollTop){
            if((div.scrollTop >= target -1 && div.scrollTop <= target + 1) 
                && isGenreLoadMoreFalse === false 
                && div.scrollTop > lastLoadScrollTick){
                setLastLoadScrollTick(div.scrollTop)
                toggleGenreLoadMore(true)
                if(stopLoad === false){
                    let page = parseInt(String(currentPageNo)) + 1;
                    store.dispatch(action_update_genre_page_no(page))
                    setCurrentPageNo(page)
                    handleGenreSearch(null,page)   
                }else{
                    toggleGenreLoadMore(false);
                }
            }
        }
        setPrevScrollTick(div.scrollTop)
    }

    const clearGenreSearch = (e:React.TouchEvent|React.MouseEvent)=>{
        console.log('back')
        e.stopPropagation();
        searchBody.current?searchBody.current.scrollTo({top:0}):null;
        store.dispatch(action_add_genre_search_object({}));
        store.dispatch(action_update_genre_page_no(0));
        store.dispatch(action_update_genre_search_scroll_tick(0));
        store.dispatch(action_update_selected_genre([]));
        store.dispatch(action_update_genre_sort("default"));
        toggleGenreSearchObject(false);
        setSelectedGenreArr([]);
        setGenreSort("default");
    }

    const handleGenreSort = () =>{
        if(sortOption.current){
            setGenreSort(sortOption.current.value);
            store.dispatch(action_update_genre_sort(sortOption.current.value));
            store.dispatch(action_update_genre_page_no(1))
            setCurrentPageNo(1)
            handleGenreSearch(null,1)
        }
    }
   

    useEffect(()=>{
        
        if(isGenreObjectLoaded === false && props.currentSrc.length !== 0 && Object.keys(props.srcObject).length !== 0){
            setGenreSort(props.srcObject[props.currentSrc].defaultSort);
            store.dispatch(action_update_genre_sort(props.srcObject[props.currentSrc].defaultSort));
            // load genre object from api
            if(Object.keys(props.genreObject).length !== 0){
                setGenreObject(props.genreObject);
                toggleSpinner(false);
                if(Object.keys(props.genreSearchObject).length !== 0){
                    setTimeout(()=>searchBody.current?searchBody.current.scrollTo({top:props.genreSearchTick,behavior: 'smooth'}):null,100)
                    setGenreSearchObject(props.genreSearchObject);
                    toggleGenreSearchObject(true);
                    setSelectedGenreArr(props.selectedGenreArray)
                    setCurrentPageNo(props.genrePageNo);
                    setGenreSort(props.genreSort);
                }
            }else{
                getGenreObject();
            }
            toggleGenreObjectLoaded(true);
        }
        
        
    })

    return(
        <div className="genre-container">
            <div style={{color:props.getColors.accentColor}}className="genre-header-wrap">
                <h1 style={{display:`${isGenreSearchObjectSet || showSpinner?'None':'Block'}`}}>{GenreHeader}</h1>
                <div style={{display:`${isGenreSearchObjectSet?'flex':'None'}`}} className="genre-back-wrap">
                    <div onClick={e =>clearGenreSearch(e)} style={{color:props.getColors.accentColor,background:props.getColors.secondaryBgColor}} className="genre-back-btn">
                        <span className="material-symbols-outlined">
                            chevron_left
                        </span>
                    </div>
                </div>
                {
                    isGenreSearchObjectSet && genreSearchObject.sorts.length > 0?
                    <div className="genre-sorts-container">
                    <select ref={sortOption} defaultValue={String(genreSort)} onChange={handleGenreSort} style={{background: props.getColors.secondaryBgColor, color:props.getColors.accentColor}} className="sort-selector">
                        {
                            genreSearchObject.sorts.map((e:any,i:number)=>{
                                return <option key={i} value={`${e}`}>{e}</option>
                            })
                        }
                    </select>
                    </div>:null
                }
                
            </div>
            <div className="genre-body-container">
                {
                    showSpinner?
                    <div className="genre-loader-wrap">
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
                    <div className="genre-body">
                        {
                            isGenreSearchObjectSet?
                            <div ref={searchBody} onScroll={e=>handleGenreScroll(e)} className="genre-search-body">
                                {
                                    genreSearchObject.resultList !== "END"?
                                    genreSearchObject.resultList.map((e:any,i:number)=>{
                                        return <div onClick={()=>props.openAboutPage(e.link)} key={i} className="genre-search-item-wrap">
                                            <div style={{color:props.getColors.accentColor,background:`linear-gradient(rgb(94 94 94 / 14%), rgb(4 4 4)),url(${e.thumb})`}} className="genre-item-thumb">
                                                <span>{e.title}</span>
                                            </div>
                                            
                                        </div>
                                    }):null
                                }
                                <div style={{color:props.getColors.secondaryBgColor}} className="genre-search-bottom-wrap">
                                    
                                    {
                                        isGenreLoadMoreFalse?
                                        <div className="genre-scroll-bottom-loader-wrap">
                                            <div className="spinner">
                                                <div style={{background:props.getColors.accentColor}} className="double-bounce1"></div>
                                                <div style={{background:props.getColors.accentColor}} className="double-bounce2"></div>
                                            </div>
                                        </div>
                                        :
                                        <h2>You have reached the end!</h2>
                                    }
                                </div>
                            </div>
                            :
                            <div className="genre-menu-body">
                                <div style={{color: props.getColors.accentColor}} className="genre-menu-wrap">
                                    {
                                        Object.keys(genreObject).length !== 0 ?
                                        genreObject.map((e:any,i:number)=>{
                                            let check:any = checkGenreInArr(e.title);
                                            return <div onClick={(event)=>addToSelectGenre(event,e.title,e.link)} style={{background:props.getColors.highLightBgColor,border:`${checkGenreInArr(e.title) === false?"None":`${ check[1] === true ?"solid #80c480 2px":"solid #d86666 2px"}`}`}} key={i} className="genre-selector-wrap">
                                                        <span>{e.title}</span>
                                                    </div>
                                        }):
                                        null
                                    }
                                </div>
                                <div className="genre-menu-bottom-wrap">
                                    <div style={{color: props.getColors.accentColor}} className="genre-selected-carousel">
                                    {
                                        selectedGenreArray.map((e:any,i:number)=>{
                                            let check:any = checkGenreInArr(e.title);
                                            return <div onClick={(event)=>removeItemfromGenreArr(event,e.title)}style={{background:props.getColors.highLightBgColor,marginLeft:`${i===0?'10%':'2%'}`,border:`${checkGenreInArr(e.title) === false?"None":`${ check[1] === true ?"solid #80c480 2px":"solid #d86666 2px"}`}`}} key={i} className="genre-carousel-item">
                                                <span>
                                                    {e.title}
                                                </span>
                                                <span  className='material-symbols-outlined genre-remove-span' >
                                                        close
                                                </span>
                                            </div>
                                        })
                                    }
                                    </div>
                                    <div className="genre-btn-wrap">    
                                        <button onClick={e=>handleGenreSearch(e)} style={{display: `${ selectedGenreArray.length !== 0? "flex":"None"}`,background:props.getColors.highLightBgColor,color: props.getColors.highLightAccentColor}} className="genre-filter-btn">
                                            <span className='material-symbols-outlined' >
                                                search
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                        
                    </div>
                }
                
            </div>
        </div>
    )
}

function mapStateToProps(state:any) {
    return state;
  }
  

export default  connect(mapStateToProps)(GenreComponent);