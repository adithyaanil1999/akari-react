import React, { FunctionComponent,useRef,useEffect,useState } from 'react';
import {backendUrl,scaperUrl}  from '../../global';
import './history.css'
import { store } from '../../index';
import { connect } from 'react-redux';


interface HistoryProps {
    getColors: any;
    openAboutPage: (url:string) => void
}  

const HistoryComponent: FunctionComponent <HistoryProps> = (props:any) =>{

    const historyCont = useRef<HTMLDivElement>(null);
    let [isHistoryObjectLoaded,toggleIsHistoryObjectLoaded] = useState<React.SetStateAction<boolean>>(false);
    let [showSpinner,toggleSpinner] = useState<React.SetStateAction<boolean>>(true);
    let [historyObj,setHistoryObj] = useState<React.SetStateAction<any>>([]);


    useEffect(()=>{ 

        setTheme();
        if(isHistoryObjectLoaded === false){
            getUserHistory()
            toggleIsHistoryObjectLoaded(true);
        }

    });

    const getUserHistory = async()=>{
        const response = await fetch(backendUrl+'getUserHistory',{
            method: 'POST',
            credentials:'include',
            headers:{
                'Content-type': 'application/json'
            },
        })

        if(response){
            let jsonResp = await response.json();
            if(jsonResp.result === 0){
                toggleSpinner(false);
            }else{
                
                toggleSpinner(false);
                const TimeSortedArr = getTimeSortedArray(jsonResp.result);
                setHistoryObj(TimeSortedArr);
                
            }
        }
    }



    const getTimeSortedArray = (arr:Array<any>)=>{
        const retSmallestTimeStampBool = (t1:any,t2:any)=>{
            
            // if t1 smaller than t2 return TRUE else FALSE
            if(t1 === t2)
                return false;
            if(t1.hours !== undefined && t2.hours === undefined)
                return false;
            else if(t2.hours !== undefined && t1.hours === undefined)
                return true;
            else if(t1.hours > t2.hours)
                return false;
            else if(t2.hours > t1.hours)
                return true;
            else if(t1.minutes !== undefined && t2.minutes === undefined)
                return true;
            else if(t2.minutes !== undefined && t1.minutes === undefined)
                return true;
            else if(t1.minutes > t2.minutes)
                return false;
            else if(t2.minutes > t1.minutes)
                return true;
            else if(t1.seconds && t2.seconds === undefined)
                return true;
            else if(t2.seconds && t1.seconds=== undefined)
                return true;
            else if(t1.seconds > t2.seconds)
                return false;
            else if(t2.seconds > t1.seconds)
                return true;
            else if(t1.milliseconds !== undefined && t2.milliseconds === undefined)
                return true;
            else if(t2.milliseconds !== undefined && t1.milliseconds=== undefined)
                return true;
            else if(t1.milliseconds >= t2.milliseconds)
                return false;
            else if(t2.milliseconds >= t1.milliseconds)
                return true;
        }

        // sort

        const swap = (arr:Array<any>,index1:number,index2:number)=>{
            const temp = arr[index1];
            arr[index1] = arr[index2];
            arr[index2] = temp;
            return arr;
        }

        for(let i=0; i<arr.length;i++){
            for(let j=0;j<arr.length;j++){
                if(retSmallestTimeStampBool(arr[i].time_difference,arr[j].time_difference) === true)
                    swap(arr,j,i)
            }
        }

        return arr


    

    }


    // maybe needed maybe not

    // const getChapterTotal =(res:Array<any>) =>{
    //     return new Promise<Array<any>>(async(resolve,reject)=>{
    //         let tempArr = []
    //         for(let i= 0; i < res.length ; i++){
    //             const response = await fetch(scaperUrl+'getMangaInfo',{
    //                 method: 'POST',
    //                 headers:{
    //                     'Content-type': 'application/json'
    //                 },
    //                 body:JSON.stringify({
    //                     url: res[i].link
    //                 })  
    //             })
    
    //             if(response){
    //                 const jsonResp = await response.json()
    //                 if(jsonResp){
    //                     tempArr.push(jsonResp.mangaInfo.chapterList.reverse()[res[i].chapter_index].chapterTitle)
    //                 }
    //             }

    //             if(i === res.length-1){
    //                 resolve(tempArr)
    //             }

    //         }

            
    //     });
       
    // }

    const setTheme = ()=>{
        // sets there from colorObj
        if(historyCont.current){
            historyCont.current.style.color = props.getColors.highLightBgColor;
        }
        
    }
    
    return(
        <div ref={historyCont} className="history-container">
            {
                showSpinner?
                <div className="history-loader-wrap">
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
                    historyObj.length === 0?
                    <div className="history-show-empty">
                    <h1>You haven't read anything, yet.</h1>
                    </div>
                    :
                    <div className="history-wrap">
                        
                        <div style={{display:`${historyObj.length > 0}`?'flex':'None'}} className="history-header-wrap">
                            <h1 style={{color: props.getColors.accentColor}}>History</h1>
                        </div>
                        <div style={{display:`${historyObj.length > 0}`?'block':'None'}} className="history-body-wrap">
                            {
                                Object.keys(props.srcObject).length !==0 ?
                                historyObj.map((e:any,i:number) => {
                                    console.log(e)
                                    return <div onClick={()=>props.openAboutPage(e.link)} style={{background:props.getColors.secondaryBgColor}} key={i} className="user-history-wrap">
                                        <div className ="history-thumb-wrap">
                                            <img src={e.thumb_link}/>
                                        </div>
                                        <div  className="history-info-wrap">
                                            <span style={{fontWeight:'900', width: '96%',textAlign: 'start',marginTop: '8%',marginLeft: '4%',fontSize:'1.2rem',color:props.getColors.accentColor}}>
                                                { e.title.length <=30 ? e.title : e.title.slice(0,30)+".."}
                                            </span>
                                            <span style={{width: '100%',textAlign: 'start',marginTop: '5%',marginLeft: '4%',fontSize:'1rem',color:props.getColors.accentColor}}>
                                                {props.srcObject[e.src].name}
                                            </span>
                                            {/* <span style={{width: '100%',textAlign: 'start',position:'absolute',top:'70%',left:'4%',fontSize:'1rem',color:props.getColors.accentColor}}>
                                                {e.last_read_chapter_title}
                                            </span> */}
                                            <span style={{width: '100%',textAlign: 'end',position:'absolute',top:'70%',left:'-15%', fontSize:'1rem',color:props.getColors.accentColor}}>
                                                {
                                                    e.time_difference.hours ? 
                                                        e.time_difference.hours + " hours ago": 
                                                        e.time_difference.minutes? 
                                                            e.time_difference.minutes + " minutes ago":
                                                            e.time_difference.seconds ? 
                                                                e.time_difference.seconds + " seconds ago":null
                                                }
                                            </span>
                                        </div>
                                    </div>
                                }):null
                            }
                        </div>
                    </div>
            }
        </div>
    )
}

function mapStateToProps(state:any) {
    return state;
}


export default connect(mapStateToProps)(HistoryComponent);