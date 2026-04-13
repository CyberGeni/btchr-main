import { useState } from 'react';
import supabase from '../../../supabase';
import Navbar from '../../../components/Navbar';
import '../../../App.css'
// assets
import bgGradient from "../../../assets/images/hero-bg-gradient.png"
import chain from "../../../assets/images/hero-chain.png"
import chainBlurred from "../../../assets/images/hero-blurred-chain.png"
import TextCarousel from '../../../components/TextCarousel/TextCarousel';
import urlRegex from 'url-regex';
import { NavLink } from 'react-router-dom';
// import FAQs from '../../../components/Accordion/Faqs';
function Home() {

  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [urlTouched, setUrlTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [shortenLinkText, setShortenLinkText] = useState('Shorten link')
  // check if link from user input is valid
  const isValidUrl = urlRegex({ exact: true, strict: false }).test(url)

  // Generate a unique identifier for the shortened link
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Check if the URL has a valid protocol
    const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
    const formattedUrl = hasProtocol ? url : `https://${url}`;

    // Generate a unique identifier for the shortened link
    const generateUniqueId = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const length = 6; // Adjust the desired length of the unique identifier

      let result = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
      }

      return result;
    };
    const uniqueId = generateUniqueId();
    const timestamp = new Date().toISOString();

    // Construct the shortened URL
    const shortenedLink = `https://btchr.vercel.app/${uniqueId}`;
    setIsLoading(true);
    setShortenLinkText('Shortening link...')
    // Save the original URL and unique identifier to the database
    await supabase
      .from('links')
      .insert([
        {
          original_url: formattedUrl,
          identifier: uniqueId,
          created_at: timestamp,
          short_url: shortenedLink,
          user_id: user ? user.id : null 
        },
      ])
      .single();

    // Update the state with the shortened URL
    setShortenedUrl(shortenedLink);
    setIsLoading(false);
    setShortenLinkText('Shorten link')
  };
  // copy to clipboard functionality
  const [copyButtonText, setCopyButtonText] = useState('Copy')
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2500); // Reset the text to 'Copy' after 3 seconds
    });
  };

  // share to socials functionality
  async function shareContent() {
    try {
      await navigator.share({
        title: "",
        text: "",
        url: shortenedUrl
      })
      console.log('shared successfully')
    } catch (error) {
      console.error("Error sharing: ", error)
    }
  }

  return (
    <div className='font-circular'>
      <div className="overflow-hidden fixed w-screen h-screen -z-10">
        <img className='w-full h-full object-cover object-center' src={bgGradient} alt="" />
      </div>
      {/* hero */}
      <section className='relative text-center px-[5%] py-8'>
        <Navbar />
        <div className='p-4 mx-auto mt-[3%] border border-[#1D2939] min-h-[77vh] flex flex-col justify-center'>
          <img className='absolute w-14 md:w-20 lg:w-40 xl:w-44 2xl:w-48 top-32 left-0' src={chain} alt="" draggable={false} />
          <img className='absolute w-14 md:w-20 lg:w-40 xl:w-44 2xl:w-48 bottom-16 right-40' src={chainBlurred} alt="" draggable={false} />
          <h1 className='hero-text lg:max-w-4xl mx-auto text-5xl md:text-7xl lg:text-[85px] p-4 font-medium'>Make that <TextCarousel /> link shorter. Super fast!</h1>
          <p className='text-gray-400 max-w-lg mx-auto my-8'>Say good bye to long, cumbersome URLs and hello to a simpler, sleeker way to shorten, share and manage your links.</p>
          <div className='max-w-lg mx-auto space-y-3 w-full'>
            <span className='text-gray-300'>Enter your link now to shorten it.</span>
            <form
              onSubmit={handleSubmit}
              action=""
              className='flex sm:grid sm:grid-cols-4 space-x-2 '>
              <input
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setUrlTouched(true)}
                className='text-gray-200 border-gray-600 border h-fit col-span-3 w-full p-4 rounded-lg bg-gray-700 shadow-gray-600/40 shadow-inner focus:outline-none placeholder:text-gray-400' type="text" placeholder='Enter link to be shortened' />
              <button className='h-fit w-fit whitespace-nowrap sm:w-full rounded-lg p-4 bg-blue-700 text-white shadow-gray-300/20 shadow-inner disabled:opacity-50' type="submit" disabled={isLoading || (url.length > 0 && !isValidUrl)}>{shortenLinkText}</button>
            </form>
            {!isValidUrl && urlTouched && (<p className='text-left w-fit text-red-500 mx-0 '>Please enter a valid link</p>)}

            {shortenedUrl && (
              <div className='flex items-center space-x-3 text-gray-100 bg-gray-600/50 rounded px-4 py-2 w-fit mx-auto backdrop-blur-sm'>
                <a href={shortenedUrl} className='text-white underline underline-offset-1' target='_blank'>{shortenedUrl}</a>
                <button onClick={handleCopyToClipboard} className='transition-all flex items-center w-fit px-3 py-1 border border-gray-200 rounded focus:outline-none'>{copyButtonText}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </button>
                <button onClick={shareContent} className='hover:bg-gray-700/60 transition-all'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>

                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* what makes us different */}
      <section id='features' className='bg-gray-900 px-[5%] py-8'>
        <h1 className='text-gray-300 text-center text-3xl md:text-4xl lg:text-5xl my-6 font-medium'>What makes us <span className=' from-[#D700EA]/70 from-35% to-[#0A5DEA]/70 to-100% bg-gradient-to-tl bg-clip-text text-transparent'>different</span></h1>
        <div className='my-8 lg:w-full max-w-screen-xl mx-auto text-gray-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 '>
          <div className='text-right bg-gray-900 border-b border-gray-800 border-r p-7 md:p-10'>
            <h3 className='text-white font-medium italic text-xl md:text-2xl lg:text-3xl pt-8 pb-3'>01</h3>
            <p className='w-3/4 sm:w-full lg:w-11/12 ml-auto'>Unlike those clingy exes from the past, our link shortener won't tie you down. Use it for personal projects, professional endeavors, anything — freedom to <span className='text-blue-500'>shorten links without commitment</span> .</p>
          </div>
          <div className='text-right bg-gray-900 border-b border-gray-800 border-r p-7 md:p-10'>
            <h3 className='text-white font-medium italic text-xl md:text-2xl lg:text-3xl pt-8 pb-3'>02</h3>
            <p className='w-3/4 sm:w-full lg:w-11/12 ml-auto'>Say goodbye to those ridiculously long web addresses that make you question the meaning of life—our link shortener squeezes them down to size, sparing you the headache!</p>
          </div>
          <div className='text-right border-b border-gray-800 border-r md:border-r-0 p-7 md:p-10'>
            <h3 className='text-white font-medium italic text-xl md:text-2xl lg:text-3xl pt-8 pb-3'>03</h3>
            <p className='w-3/4 sm:w-full lg:w-11/12 ml-auto'> Our links are <span className='text-blue-500'>speed demons</span>. With our turbo-charged technology, you'll be sharing your shortened URLs before you can say "supercalifragilisticexpialidocious" (well, almost)</p>
          </div>
          <div className='text-right border-b md:border-b-0 border-gray-800 border-r p-7 md:p-10'>
            <h3 className='text-white font-medium italic text-xl md:text-2xl lg:text-3xl pt-8 md:pt-0 pb-3'>04</h3>
            <p className='w-3/4 sm:w-full lg:w-11/12 ml-auto'>Make those shortened links truly your own! Our link shortener lets you <span className='text-blue-500'>unleash your creative genius</span> with personalized slugs, so your URLs can be as unique as your sense of style.</p>
          </div>
          <div className='text-right border-b sm:border-b-0 border-gray-800 border-r p-7 md:p-10'>
            <h3 className='text-white font-medium italic text-xl md:text-2xl lg:text-3xl pt-8 md:pt-0 pb-3'>05</h3>
            <p className='w-3/4 sm:w-full lg:w-11/12 ml-auto'>Wondering if anyone is actually clicking on your shortened links? We've got you covered! Our <span className='text-blue-500'>analytics feature</span> reveals who's been clicking, where they're from, and maybe even what they had for breakfast (okay, not really).</p>
          </div>
          <div className='text-right  border-gray-800 border-r md:border-r-0 p-7 md:p-10'>
            <h3 className='text-white font-medium italic text-xl md:text-2xl lg:text-3xl pt-8 md:pt-0 pb-3'>06</h3>
            <p className='w-3/4 sm:w-full lg:w-11/12 ml-auto'>Got a question or need a helping hand? Our <span className='text-blue-500'>friendly support team</span> is here to rescue you, no matter the hour. We're like superheroes, but with fewer capes and more technical expertise.</p>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id='pricing' className='bg-gray-900 px-[5%] py-8'>
        <h1 className='text-gray-300 text-center text-3xl md:text-4xl lg:text-5xl my-6 font-medium'>Affordable <span className=' from-[#D700EA]/70 from-35% to-[#0A5DEA]/70 to-100% bg-gradient-to-tl bg-clip-text text-transparent'>pricing</span></h1>
        <p className='text-gray-400 text-lg text-center w-4/5 max-w-xl mx-auto'>Our link shortener is almost completely free, but we need to keep the lights on so some extra features are restricted to premium users for a tiny fee.</p>
        <div className='flex flex-col space-y-8 md:space-y-0 md:flex-row items-center justify-center my-12'>
          {/* free plan tier card */}
          <div className='border-gray-600 border rounded-xl p-8 md:pr-12'>
            <h4 className='text-white text-center'>Free plan</h4>
            <h1 className='text-gray-400 text-4xl my-3 font-bold text-center'>$0/mth</h1>
            <p className='text-gray-500 text-center'>Our most popular plan</p>
            <ul className='my-4 space-y-2'>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>
                Unlimited shortened links
              </li>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>
                100 customised links
              </li>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>
                Basic analytics
              </li>
              {/* <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>

                Access to all basic features
              </li> */}
            </ul>
            
          </div>

          {/* pro plan tier card */}
          <div className='md:-ml-6 bg-gray-800 border-gray-600 border rounded-xl'>
            <div>
              <svg className='rounded-t-xl' width="340" height="42" viewBox="0 0 360 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="360" height="44" fill="url(#paint0_radial_234_7010)" />
                <path d="M120.887 16.8182H122.752L125.993 24.733H126.112L129.354 16.8182H131.218V27H129.756V19.6321H129.662L126.659 26.9851H125.446L122.443 19.6271H122.349V27H120.887V16.8182ZM136.549 27.1541C135.833 27.1541 135.208 26.9901 134.675 26.6619C134.141 26.3338 133.727 25.8748 133.432 25.2848C133.137 24.6948 132.989 24.0054 132.989 23.2166C132.989 22.4245 133.137 21.7318 133.432 21.1385C133.727 20.5452 134.141 20.0845 134.675 19.7564C135.208 19.4283 135.833 19.2642 136.549 19.2642C137.265 19.2642 137.89 19.4283 138.423 19.7564C138.957 20.0845 139.371 20.5452 139.666 21.1385C139.961 21.7318 140.109 22.4245 140.109 23.2166C140.109 24.0054 139.961 24.6948 139.666 25.2848C139.371 25.8748 138.957 26.3338 138.423 26.6619C137.89 26.9901 137.265 27.1541 136.549 27.1541ZM136.554 25.9062C137.018 25.9062 137.402 25.7836 137.707 25.5384C138.012 25.2931 138.238 24.9666 138.383 24.5589C138.533 24.1513 138.607 23.7022 138.607 23.2116C138.607 22.7244 138.533 22.277 138.383 21.8693C138.238 21.4583 138.012 21.1286 137.707 20.88C137.402 20.6314 137.018 20.5071 136.554 20.5071C136.087 20.5071 135.699 20.6314 135.391 20.88C135.086 21.1286 134.859 21.4583 134.709 21.8693C134.564 22.277 134.491 22.7244 134.491 23.2116C134.491 23.7022 134.564 24.1513 134.709 24.5589C134.859 24.9666 135.086 25.2931 135.391 25.5384C135.699 25.7836 136.087 25.9062 136.554 25.9062ZM147.49 21.228L146.143 21.4666C146.086 21.2943 145.997 21.1302 145.874 20.9744C145.755 20.8187 145.593 20.6911 145.387 20.5916C145.182 20.4922 144.925 20.4425 144.617 20.4425C144.196 20.4425 143.844 20.5369 143.563 20.7259C143.281 20.9115 143.14 21.1518 143.14 21.4467C143.14 21.7019 143.234 21.9074 143.423 22.0632C143.612 22.219 143.917 22.3466 144.338 22.446L145.551 22.7244C146.254 22.8868 146.778 23.1371 147.122 23.4751C147.467 23.8132 147.639 24.2524 147.639 24.7926C147.639 25.25 147.507 25.6577 147.242 26.0156C146.98 26.3703 146.613 26.6487 146.143 26.8509C145.676 27.053 145.134 27.1541 144.517 27.1541C143.662 27.1541 142.964 26.9718 142.424 26.6072C141.884 26.2393 141.552 25.7173 141.43 25.0412L142.867 24.8224C142.956 25.197 143.14 25.4804 143.418 25.6726C143.697 25.8615 144.06 25.956 144.507 25.956C144.994 25.956 145.384 25.8549 145.676 25.6527C145.967 25.4472 146.113 25.197 146.113 24.902C146.113 24.6634 146.024 24.4628 145.845 24.3004C145.669 24.138 145.399 24.0154 145.034 23.9325L143.742 23.6491C143.029 23.4867 142.502 23.2282 142.161 22.8736C141.823 22.5189 141.653 22.0698 141.653 21.5263C141.653 21.0755 141.779 20.6811 142.031 20.343C142.283 20.005 142.631 19.7415 143.075 19.5526C143.52 19.3603 144.028 19.2642 144.602 19.2642C145.427 19.2642 146.077 19.4432 146.551 19.8011C147.024 20.1558 147.338 20.6314 147.49 21.228ZM152.838 19.3636V20.5568H148.667V19.3636H152.838ZM149.786 17.5341H151.272V24.7578C151.272 25.0462 151.315 25.2633 151.402 25.4091C151.488 25.5516 151.599 25.6494 151.735 25.7024C151.874 25.7521 152.025 25.777 152.187 25.777C152.306 25.777 152.411 25.7687 152.5 25.7521C152.59 25.7356 152.659 25.7223 152.709 25.7124L152.978 26.9403C152.891 26.9735 152.769 27.0066 152.61 27.0398C152.451 27.0762 152.252 27.0961 152.013 27.0994C151.622 27.1061 151.257 27.0365 150.919 26.8906C150.581 26.7448 150.308 26.5194 150.099 26.2145C149.89 25.9096 149.786 25.5268 149.786 25.0661V17.5341ZM158.188 29.8636V19.3636H159.639V20.6016H159.764C159.85 20.4425 159.974 20.2585 160.137 20.0497C160.299 19.8409 160.524 19.6586 160.813 19.5028C161.101 19.3438 161.482 19.2642 161.956 19.2642C162.573 19.2642 163.123 19.42 163.607 19.7315C164.091 20.0431 164.47 20.4922 164.745 21.0788C165.024 21.6655 165.163 22.3714 165.163 23.1967C165.163 24.022 165.025 24.7296 164.75 25.3196C164.475 25.9062 164.097 26.3587 163.617 26.6768C163.136 26.9917 162.588 27.1491 161.971 27.1491C161.507 27.1491 161.128 27.0713 160.833 26.9155C160.541 26.7597 160.312 26.5774 160.147 26.3686C159.981 26.1598 159.853 25.9742 159.764 25.8118H159.674V29.8636H158.188ZM159.644 23.1818C159.644 23.7187 159.722 24.1894 159.878 24.5938C160.034 24.9981 160.259 25.3146 160.554 25.5433C160.849 25.7687 161.21 25.8814 161.638 25.8814C162.082 25.8814 162.453 25.7637 162.752 25.5284C163.05 25.2898 163.275 24.9666 163.428 24.5589C163.584 24.1513 163.661 23.6922 163.661 23.1818C163.661 22.678 163.585 22.2256 163.433 21.8246C163.284 21.4235 163.058 21.107 162.757 20.875C162.458 20.643 162.085 20.527 161.638 20.527C161.207 20.527 160.843 20.638 160.544 20.8601C160.249 21.0821 160.026 21.392 159.873 21.7898C159.721 22.1875 159.644 22.6515 159.644 23.1818ZM170.045 27.1541C169.329 27.1541 168.704 26.9901 168.171 26.6619C167.637 26.3338 167.223 25.8748 166.928 25.2848C166.633 24.6948 166.485 24.0054 166.485 23.2166C166.485 22.4245 166.633 21.7318 166.928 21.1385C167.223 20.5452 167.637 20.0845 168.171 19.7564C168.704 19.4283 169.329 19.2642 170.045 19.2642C170.761 19.2642 171.386 19.4283 171.919 19.7564C172.453 20.0845 172.867 20.5452 173.162 21.1385C173.457 21.7318 173.605 22.4245 173.605 23.2166C173.605 24.0054 173.457 24.6948 173.162 25.2848C172.867 25.8748 172.453 26.3338 171.919 26.6619C171.386 26.9901 170.761 27.1541 170.045 27.1541ZM170.05 25.9062C170.514 25.9062 170.898 25.7836 171.203 25.5384C171.508 25.2931 171.734 24.9666 171.88 24.5589C172.029 24.1513 172.103 23.7022 172.103 23.2116C172.103 22.7244 172.029 22.277 171.88 21.8693C171.734 21.4583 171.508 21.1286 171.203 20.88C170.898 20.6314 170.514 20.5071 170.05 20.5071C169.583 20.5071 169.195 20.6314 168.887 20.88C168.582 21.1286 168.355 21.4583 168.206 21.8693C168.06 22.277 167.987 22.7244 167.987 23.2116C167.987 23.7022 168.06 24.1513 168.206 24.5589C168.355 24.9666 168.582 25.2931 168.887 25.5384C169.195 25.7836 169.583 25.9062 170.05 25.9062ZM175.264 29.8636V19.3636H176.716V20.6016H176.84C176.926 20.4425 177.05 20.2585 177.213 20.0497C177.375 19.8409 177.601 19.6586 177.889 19.5028C178.177 19.3438 178.558 19.2642 179.032 19.2642C179.649 19.2642 180.199 19.42 180.683 19.7315C181.167 20.0431 181.546 20.4922 181.821 21.0788C182.1 21.6655 182.239 22.3714 182.239 23.1967C182.239 24.022 182.102 24.7296 181.826 25.3196C181.551 25.9062 181.174 26.3587 180.693 26.6768C180.212 26.9917 179.664 27.1491 179.047 27.1491C178.583 27.1491 178.204 27.0713 177.909 26.9155C177.617 26.7597 177.388 26.5774 177.223 26.3686C177.057 26.1598 176.929 25.9742 176.84 25.8118H176.75V29.8636H175.264ZM176.721 23.1818C176.721 23.7187 176.799 24.1894 176.954 24.5938C177.11 24.9981 177.335 25.3146 177.63 25.5433C177.925 25.7687 178.287 25.8814 178.714 25.8814C179.158 25.8814 179.53 25.7637 179.828 25.5284C180.126 25.2898 180.352 24.9666 180.504 24.5589C180.66 24.1513 180.738 23.6922 180.738 23.1818C180.738 22.678 180.661 22.2256 180.509 21.8246C180.36 21.4235 180.134 21.107 179.833 20.875C179.535 20.643 179.162 20.527 178.714 20.527C178.283 20.527 177.919 20.638 177.62 20.8601C177.325 21.0821 177.102 21.392 176.949 21.7898C176.797 22.1875 176.721 22.6515 176.721 23.1818ZM188.742 23.8331V19.3636H190.233V27H188.772V25.6776H188.692C188.517 26.0852 188.235 26.425 187.847 26.6967C187.463 26.9652 186.984 27.0994 186.41 27.0994C185.92 27.0994 185.486 26.9917 185.108 26.7763C184.733 26.5575 184.438 26.2344 184.223 25.8068C184.011 25.3793 183.905 24.8506 183.905 24.2209V19.3636H185.391V24.0419C185.391 24.5623 185.535 24.9766 185.824 25.2848C186.112 25.593 186.486 25.7472 186.947 25.7472C187.226 25.7472 187.502 25.6776 187.777 25.5384C188.056 25.3991 188.286 25.1887 188.468 24.907C188.654 24.6252 188.745 24.2673 188.742 23.8331ZM193.717 16.8182V27H192.231V16.8182H193.717ZM197.939 27.169C197.455 27.169 197.018 27.0795 196.627 26.9006C196.236 26.7183 195.926 26.4548 195.697 26.1101C195.472 25.7654 195.359 25.3428 195.359 24.8423C195.359 24.4115 195.442 24.0568 195.608 23.7784C195.773 23.5 195.997 23.2796 196.279 23.1172C196.561 22.9548 196.875 22.8321 197.223 22.7493C197.571 22.6664 197.926 22.6035 198.287 22.5604C198.745 22.5073 199.116 22.4643 199.401 22.4311C199.686 22.3946 199.893 22.3366 200.022 22.2571C200.152 22.1776 200.216 22.0483 200.216 21.8693V21.8345C200.216 21.4003 200.094 21.0639 199.848 20.8253C199.607 20.5866 199.245 20.4673 198.765 20.4673C198.264 20.4673 197.87 20.5784 197.581 20.8004C197.296 21.0192 197.099 21.2628 196.99 21.5312L195.593 21.2131C195.758 20.7491 196 20.3745 196.319 20.0895C196.64 19.8011 197.01 19.5923 197.427 19.4631C197.845 19.3305 198.284 19.2642 198.745 19.2642C199.05 19.2642 199.373 19.3007 199.714 19.3736C200.059 19.4432 200.38 19.5724 200.679 19.7614C200.98 19.9503 201.227 20.2204 201.419 20.5717C201.612 20.9197 201.708 21.3722 201.708 21.929V27H200.256V25.956H200.196C200.1 26.1482 199.956 26.3371 199.764 26.5227C199.572 26.7083 199.325 26.8625 199.023 26.9851C198.722 27.1077 198.36 27.169 197.939 27.169ZM198.263 25.9759C198.674 25.9759 199.025 25.8946 199.316 25.7322C199.611 25.5698 199.835 25.3577 199.988 25.0959C200.143 24.8307 200.221 24.5473 200.221 24.2457V23.2614C200.168 23.3144 200.066 23.3641 199.913 23.4105C199.764 23.4536 199.593 23.4917 199.401 23.5249C199.209 23.5547 199.022 23.5829 198.839 23.6094C198.657 23.6326 198.504 23.6525 198.382 23.669C198.093 23.7055 197.83 23.7668 197.591 23.853C197.356 23.9392 197.167 24.0634 197.025 24.2259C196.885 24.3849 196.816 24.5971 196.816 24.8622C196.816 25.2301 196.952 25.5085 197.223 25.6974C197.495 25.883 197.842 25.9759 198.263 25.9759ZM203.688 27V19.3636H205.125V20.5767H205.204C205.343 20.1657 205.589 19.8426 205.94 19.6072C206.295 19.3686 206.696 19.2493 207.143 19.2493C207.236 19.2493 207.345 19.2526 207.471 19.2592C207.6 19.2659 207.701 19.2741 207.774 19.2841V20.706C207.715 20.6894 207.609 20.6712 207.456 20.6513C207.304 20.6281 207.151 20.6165 206.999 20.6165C206.648 20.6165 206.334 20.6911 206.059 20.8402C205.787 20.986 205.572 21.1899 205.413 21.4517C205.254 21.7102 205.174 22.0052 205.174 22.3366V27H203.688ZM212.766 29.8636V19.3636H214.218V20.6016H214.342C214.428 20.4425 214.552 20.2585 214.715 20.0497C214.877 19.8409 215.103 19.6586 215.391 19.5028C215.679 19.3438 216.06 19.2642 216.534 19.2642C217.151 19.2642 217.701 19.42 218.185 19.7315C218.669 20.0431 219.048 20.4922 219.323 21.0788C219.602 21.6655 219.741 22.3714 219.741 23.1967C219.741 24.022 219.603 24.7296 219.328 25.3196C219.053 25.9062 218.675 26.3587 218.195 26.6768C217.714 26.9917 217.166 27.1491 216.549 27.1491C216.085 27.1491 215.706 27.0713 215.411 26.9155C215.119 26.7597 214.89 26.5774 214.725 26.3686C214.559 26.1598 214.431 25.9742 214.342 25.8118H214.252V29.8636H212.766ZM214.223 23.1818C214.223 23.7187 214.3 24.1894 214.456 24.5938C214.612 24.9981 214.837 25.3146 215.132 25.5433C215.427 25.7687 215.789 25.8814 216.216 25.8814C216.66 25.8814 217.032 25.7637 217.33 25.5284C217.628 25.2898 217.853 24.9666 218.006 24.5589C218.162 24.1513 218.24 23.6922 218.24 23.1818C218.24 22.678 218.163 22.2256 218.011 21.8246C217.862 21.4235 217.636 21.107 217.335 20.875C217.036 20.643 216.664 20.527 216.216 20.527C215.785 20.527 215.421 20.638 215.122 20.8601C214.827 21.0821 214.604 21.392 214.451 21.7898C214.299 22.1875 214.223 22.6515 214.223 23.1818ZM222.893 16.8182V27H221.407V16.8182H222.893ZM227.115 27.169C226.631 27.169 226.194 27.0795 225.803 26.9006C225.412 26.7183 225.102 26.4548 224.873 26.1101C224.648 25.7654 224.535 25.3428 224.535 24.8423C224.535 24.4115 224.618 24.0568 224.783 23.7784C224.949 23.5 225.173 23.2796 225.455 23.1172C225.736 22.9548 226.051 22.8321 226.399 22.7493C226.747 22.6664 227.102 22.6035 227.463 22.5604C227.921 22.5073 228.292 22.4643 228.577 22.4311C228.862 22.3946 229.069 22.3366 229.198 22.2571C229.328 22.1776 229.392 22.0483 229.392 21.8693V21.8345C229.392 21.4003 229.27 21.0639 229.024 20.8253C228.782 20.5866 228.421 20.4673 227.94 20.4673C227.44 20.4673 227.046 20.5784 226.757 20.8004C226.472 21.0192 226.275 21.2628 226.166 21.5312L224.769 21.2131C224.934 20.7491 225.176 20.3745 225.494 20.0895C225.816 19.8011 226.185 19.5923 226.603 19.4631C227.021 19.3305 227.46 19.2642 227.921 19.2642C228.225 19.2642 228.549 19.3007 228.89 19.3736C229.235 19.4432 229.556 19.5724 229.854 19.7614C230.156 19.9503 230.403 20.2204 230.595 20.5717C230.787 20.9197 230.884 21.3722 230.884 21.929V27H229.432V25.956H229.372C229.276 26.1482 229.132 26.3371 228.94 26.5227C228.747 26.7083 228.501 26.8625 228.199 26.9851C227.897 27.1077 227.536 27.169 227.115 27.169ZM227.438 25.9759C227.849 25.9759 228.201 25.8946 228.492 25.7322C228.787 25.5698 229.011 25.3577 229.163 25.0959C229.319 24.8307 229.397 24.5473 229.397 24.2457V23.2614C229.344 23.3144 229.241 23.3641 229.089 23.4105C228.94 23.4536 228.769 23.4917 228.577 23.5249C228.385 23.5547 228.197 23.5829 228.015 23.6094C227.833 23.6326 227.68 23.6525 227.558 23.669C227.269 23.7055 227.006 23.7668 226.767 23.853C226.532 23.9392 226.343 24.0634 226.2 24.2259C226.061 24.3849 225.992 24.5971 225.992 24.8622C225.992 25.2301 226.127 25.5085 226.399 25.6974C226.671 25.883 227.017 25.9759 227.438 25.9759ZM234.35 22.4659V27H232.864V19.3636H234.29V20.6065H234.385C234.561 20.2022 234.836 19.8774 235.21 19.6321C235.588 19.3868 236.064 19.2642 236.637 19.2642C237.157 19.2642 237.613 19.3736 238.004 19.5923C238.395 19.8078 238.699 20.1293 238.914 20.5568C239.129 20.9844 239.237 21.513 239.237 22.1428V27H237.751V22.3217C237.751 21.7682 237.606 21.3357 237.318 21.0241C237.03 20.7093 236.634 20.5518 236.13 20.5518C235.785 20.5518 235.479 20.6264 235.21 20.7756C234.945 20.9247 234.735 21.1435 234.579 21.4318C234.426 21.7169 234.35 22.0616 234.35 22.4659Z" fill="white" />
                <defs>
                  <radialGradient id="paint0_radial_234_7010" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 22) rotate(82.4824) scale(39.4502 326.062)">
                    <stop stopColor="#0A5DEA" />
                    <stop offset="1" stopColor="#D700EA" stopOpacity="0.7" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <h1 className='text-white text-4xl font-bold text-center my-5'>$5/mth</h1>
            <p className='text-gray-500 text-center'>Ideal for small teams and startups.</p>
            <ul className='my-4 px-8 space-y-2'>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>

                Access to all basic features
              </li>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>

                Unlimited customised links
              </li>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>
                Advanced analytics
              </li>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>

                24/7 priority email support
              </li>
              <li className='text-gray-300 flex items-center'>
                <svg className='mr-2' width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L13.9282 4V12L7 16L0.0717969 12V4L7 0Z" fill="#475467" />
                </svg>
                Custom link previews
              </li>    
            </ul>
            <NavLink to='/register' className='mx-8 my-6 bg-blue-700 text-white text-center py-2 px-4 rounded-lg block'>Create account</NavLink>
          </div>
        </div>
      </section>

      {/* faqs */}
      <section>
        {/* <FAQs /> */}
      </section>
      <footer className='space-y-6 md:space-y-0 flex-col md:flex-row bg-gray-900 px-[5%] py-9 border-t border-gray-800 border- flex justify-between items-center'>
        <div className='space-y-6 md:space-y-0 flex flex-col md:flex-row items-center md:space-x-8'>
          <span className='flex items-center text-gray-100 font-bold text-4xl tracking-tighter'>btchr<span className='text-blue-700 text-6xl -mt-4'>.</span></span>
          <div className='text-gray-200 space-x-4'>
            <a href="">Features</a>
            <a href="">Pricing</a>
            <a href="">FAQs</a>
          </div>
        </div>
        <div className='text-gray-400 text-center order-last md:order-none'>built by <a className='underline underline-offset-2' href="https://x.com/cybergenie_" target='_blank'>treasure.</a></div>
        <div className='text-gray-400 text-center '>&copy; 2023 btchr.</div>
      </footer>
    </div>
  )
}

export default Home
