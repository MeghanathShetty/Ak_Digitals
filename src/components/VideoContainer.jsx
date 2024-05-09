import React, { useState, useEffect, useRef } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { toastErrorStyle } from './uitls/toastStyle';
import { InView } from "react-intersection-observer";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const storage = getStorage(app);

function VideoContainer() {

  // Define state variables
  const [isOpened, setIsOpened] = useState(false);
  const [data, setData] = useState({ video: '', i: 0 });
  const [videoUrls, setVideoUrls] = useState([]);
  const observer = useRef(null);
  const [page, setPage] = useState(1);
  const videosPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [moreCount, setMoreCount] = useState(0);
  const [videoRefs, setVideoRefs] = useState([]);
  const [hoveredVideoIndex, setHoveredVideoIndex] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsOpened(true);
    }, 1000);
    setIsOpened(true);
    return () => clearTimeout(timeout);
  }, []);

  // Function to view video
  const viewVideo = (video, i) => {
    setData({ video, i });
    setIsOpened(true);
  }

  // Function to handle video actions (next, previous, close)
  const videoAction = (action) => {
    if (action === 'next-video') {
      let newIndex = data.i + 1;
      if (newIndex < videoUrls.length) {
        setData({ video: videoUrls[newIndex].url, i: newIndex });
      }
    } else if (action === 'previous-video') {
      let newIndex = data.i - 1;
      if (newIndex >= 0) {
        setData({ video: videoUrls[newIndex].url, i: newIndex });
      }
    } else if (action === 'close-video') {
      setIsOpened(false); // Close the full-screen view
    }
  }

  useEffect(() => {
    initialFetchVideos(); // Fetch videos on component mount
  }, []);

  useEffect(() => {
    fetchVideos(); // Fetch videos when page or videoRefs change
  }, [page, videoRefs]);

  async function initialFetchVideos() {
    setIsLoading(true);
    try {
      const videoRefsTemp = await listAll(ref(storage, 'videos')); // List items inside 'videos' folder
      setVideoRefs(videoRefsTemp);
    } catch (error) {
      toast.error("Something went wrong, Please try again!", toastErrorStyle());
      console.error('Error listing items in storage:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchVideos() {
    if (videoRefs && videoRefs.items && videoRefs.items.length >= 1) {
      setIsLoading(true);
      try {
        const startIndex = (page - 1) * videosPerPage;
        const endIndex = startIndex + videosPerPage;

        const totalPages = Math.ceil(videoRefs.items.length / videosPerPage);
        
        const urls = await Promise.all(videoRefs.items.slice(startIndex, endIndex).map(async (itemRef) => {
          try {
            const url = await getDownloadURL(itemRef);
            return { url, loaded: false };
          } catch (error) {
            console.error('Error getting download URL for itemRef:', error);
            return null;
          }
        }));

        // If it's the last page, reset the page count
        if (page === totalPages) {
          setPage(1);
          setMoreCount(0);
        }

        // if viewMoreCount >= 3, then replace old videos with new ones, else add to the div
        // if (moreCount >= 3) {
          // setVideoUrls(urls.filter(item => item !== null));
          // setMoreCount(0);
        // } else {
          setVideoUrls(prevUrls => [...prevUrls, ...urls.filter(url => url !== null)]);
        // }
      } catch (error) {
        toast.error("Something went wrong, Please try again!", toastErrorStyle());
        console.error('Error listing items in storage:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleViewMore = () => {
    setPage(prevPage => prevPage + 1);
    setMoreCount(prevCount => prevCount + 1);
  };

  const handleVideoLoad = (index) => {
    setVideoUrls(prevVideoUrls => {
      const updatedVideoUrls = [...prevVideoUrls];
      updatedVideoUrls[index].loaded = true; // Mark video as loaded
      return updatedVideoUrls;
    });
  };

  return (
    <>
      {data.video && (
        <div className={`full-screen-video-container ${isOpened ? 'open' : 'close'}`}>
          <button className="close-btn" onClick={() => videoAction('close-video')}>
            <FontAwesomeIcon icon={faTimes} />
          </button>

          {data.i > 0 && (
            <button className="nav-btn prev-btn" onClick={() => videoAction('previous-video')}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}
          <video src={data.video} className="full-screen-video" controls></video>
          {data.i < videoUrls.length - 1 && (
            <button className="nav-btn next-btn" onClick={() => videoAction('next-video')}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
        </div>
      )}
      <div className={`video-container ${isOpened ? 'animate' : ''}`}>
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 2, 900: 3 }}>
          <Masonry gutter='17px'>
            {videoUrls.map(({ url, loaded }, index) => (
              <InView
                as="video"
                key={index}
                onChange={(inView) => {inView && loaded ? url=url : url = ''}}
                onLoadedData={() => handleVideoLoad(index)}
                src={url}
                alt={`Video ${index}`}
                data-index={index}
                onClick={() => viewVideo(url, index)} // Click to open video in full-screen
                style={{ display: loaded ? 'inline' : 'none' }}
                autoPlay={false}
                muted
              >
                  </InView>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
      <div className='loading-viewMore' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
        {/* Loading animation */}
        {isLoading && <div className='loading'></div>}

        {/* Loading Button */}
        {videoUrls.length > 0 && (
          <InView
              as="div"
              onChange={(inView) => inView? handleViewMore()  : ''}
              style={{
              position: 'relative',
              width: '100px',
              height:'25px'
              }}>
              <div className='line'></div>
          </InView>
        )}
      </div>
    </>
  );
}

export default VideoContainer;
