import React from 'react';
import { Link } from 'react-router-dom';
import { IoMdImages, IoIosVideocam } from "react-icons/io";
import '../css/Dashboard.css';
import { getFirebaseConfig } from '../components/uitls/firebaseConfig';
import TabsComponent from '../components/TabsComponent';
import PhotoUpload from '../components/PhotoUpload';
import VideoUpload from '../components/VideoUpload';
import { CheckAdminLogin } from '../components/uitls/checkAdminLogin';

// Firebase stuff ( Important )
const { storage, app } = getFirebaseConfig();

function DashBoard(){

    // Check if authorized user, ie. admin
    CheckAdminLogin({app, getBool : false});

    return (
        <div className='DashBoard-div'>
        
            <div className='header-Main'>

                <div className="heading-container">
                    <h1 className="sofia-regular">AK DIGITALS</h1>
                </div>
                
                <div className='header-links'>
                    <Link to='/ContactPage' className="teko-headings">CONTACT</Link>
                </div>

              
            </div>
            <div className='MainDashBoardDiv'>
                <div className='CountDiv'>
                    <div className='PhotoCountDiv'>
                        <IoMdImages className='cameraIcon'/>
                        <p>PHOTOS<br/><span>100</span></p>
                    </div>
                    <div className='VideoCountDiv'>
                        <IoIosVideocam className='VideoIcon'/>
                        <p>VIDEOS<br/><span>100</span></p>  
                    </div>
                </div>
                <div className='Update-div'>
                    <TabsComponent storage={storage} Tab1={PhotoUpload} Tab2={VideoUpload}/>
                </div>

                <div className='dashboard-delete-section'>
                    <button >Delete Photos</button>
                    <button >Delete Videos</button>
                </div>
    
            </div>
        </div>
    );
}

export default DashBoard;
