import { User as MyUser } from '../../../types/userTypes'; // Import custom User type with alias
import filterIcon from '../../../assets/icons/filter.png';
import eye from '../../../assets/icons/eye.png';
import supabase from '../../../supabase';
import { useEffect, useState } from 'react';
// import { saveAs } from 'file-saver';
import '../../../Dashboard.css'
import EditLinkModal from '../../../components/Modals/EditLinkModal';
import { Popover, Transition } from '@headlessui/react'
import moment from 'moment';
import { Fragment } from 'react'
import ShareLinkModal from '../../../components/Modals/ShareLinkModal';
import DeleteLinkModal from '../../../components/Modals/DeleteLinkModal';
import TopClickSource from '../../../components/Dashboard/Sidebar/TopClickSource';
import QRCode from '../../../components/Dashboard/Sidebar/QRCode';

interface Link {
    id: string;
    url: string;
    original_url: string;
    short_url: string;
    name: string;
    linkName: string;
    customIdentifier: string;
    identifier: string;
    click_count: number;
    click_source: string[];
    click_location: string[];
    created_at: string;
    // Add other properties as needed
}

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<MyUser | null>(null); // Use the custom User type
    const [links, setLinks] = useState<Link[]>([]);
    const [selectedLink, setSelectedLink] = useState<Link | null>(null);
    const [showDetails, setShowDetails] = useState(false)
    const [sortBy, setSortBy] = useState('new-old')
    // fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            const session = await supabase.auth.getSession();
            const currentUser = session?.data?.session?.user;

            if (currentUser) {
                setUser(currentUser as MyUser); // Cast currentUser to MyUser type
            } else {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    // fetch user links
    useEffect(() => {
        const fetchUserLinks = async () => {
            console.log('Fetching user links...');
            // Fetch all links associated with the user
            const { data, error } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', user?.id);
            if (error) {
                console.error('Error fetching user links from Supabase:', error);
                // Handle the error case
            } else {
                // console.log(data)
                const formattedData = data as Link[]; // Explicitly cast the data to Link[]
                setLinks(formattedData);
                if (formattedData && formattedData.length > 0) {
                    setSelectedLink(formattedData[0]);
                }
            }
        };
        fetchUserLinks();

    }, [user]);

    // Count the occurrences of each location
    const locationCountMap = selectedLink?.click_location?.reduce((countMap: { [location: string]: number; }, location: string | number) => {
        countMap[location] = (countMap[location] || 0) + 1;
        return countMap;
    }, {});

    console.log(selectedLink?.click_location)
    // Find the location with the highest count
    let mostFrequentLocation = null;
    let maxCount = 0;

    for (const location in locationCountMap) {
        if (locationCountMap[location] > maxCount) {
            mostFrequentLocation = location;
            maxCount = locationCountMap[location];
        }
    }

    const sortingOptions = [
        { label: 'Date (old - new)', value: 'old-new' },
        { label: 'Date (new - old)', value: 'new-old' },
        { label: 'alphabetically (a - z)', value: 'alpha-asc' },
        { label: 'alphabetically (z - a)', value: 'alpha-desc' },
        { label: 'clicks (high - low)', value: 'clicks-high' },
        { label: 'clicks (low - high)', value: 'clicks-low' },
    ]
    const sortedLinks = () => {
        const sorted = [...links]

        switch (sortBy) {
            case 'old-new':
                sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                break
            case 'new-old':
                sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                break
            case 'alpha-asc':
                sorted.sort((a, b) =>
                    (a.name || a.linkName || '').localeCompare(b.name || b.linkName || '')
                )
                break
            case 'alpha-desc':
                sorted.sort((a, b) =>
                    (b.name || b.linkName || '').localeCompare(a.name || a.linkName || '')
                )
                break
            case 'clicks-high':
                sorted.sort((a, b) => b.click_count - a.click_count)
                break
            case 'clicks-low':
                sorted.sort((a, b) => a.click_count - b.click_count)
                break
            default:
                break
        }

        return sorted
    }

    const handleSortingSelect = (option: { value: any; }) => {
        setSortBy(option.value)
    }
    return (
        <>
            <section className='dashboard bg-gray-200 mt-20 w-full'>
                <div className="relative flex w-full overflow-x-hidden">
                    {/* links section */}
                    <div className={`bg-white w-full sm:w-[75%] md:fixed md:w-[40%] lg:w-[35%] xl:w-[25%] col-span-2
                        ${showDetails ? "" : "fixed"}
                    `}>
                        <div className=" relative border-r border-gray-200">
                            {/* link header */}
                            <div className="w-auto px-6 py-4 bg-white flex items-center justify-between">
                                <h3 className='font-medium text-lg'>All links</h3>

                                <Popover className="relative">
                                    {() => (
                                        <>
                                            <Popover.Button>
                                                <div className='flex rounded-md border border-gray-100 items-center bg-white space-x-2 px-5 py-3 shadow-[1px_1px_2px_0px_rgba(203,203,209,0.29)]'>
                                                    <span className='text-gray-500'>Sort by</span>
                                                    <img className='w-5 h-5' src={filterIcon} alt="" />
                                                </div>
                                            </Popover.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="opacity-0 translate-y-1"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in duration-150"
                                                leaveFrom="opacity-100 translate-y-0"
                                                leaveTo="opacity-0 translate-y-1"
                                            >
                                                <Popover.Panel className="absolute -right-24 z-10 mt-3 w-screen max-w-[11.5rem] -translate-x-1/2 transform px-4 sm:px-0">
                                                    <div className="p-3 *:py-3 bg-white flex flex-col overflow-hidden rounded-lg shadow-lg">
                                                        {sortingOptions.map((option) => (
                                                            <span
                                                                key={option.value}
                                                                onClick={() => handleSortingSelect(option)}
                                                                className={`text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded-md block ${sortBy === option.value ? 'bg-gray-100' : ''
                                                                    }`}
                                                            >
                                                                {option.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </Popover.Panel>
                                            </Transition>
                                        </>
                                    )}
                                </Popover>
                            </div>
                            {/* list of links */}
                            <div className='overflow-x-hidden pb-20 sm:pb-0 overflow-y-scroll h-[76vh] lg:h-[77vh]'>
                                {/* check if there are links */}
                                {links.length === 0 && (
                                    <div className='my-6 w-full flex justify-center items-center'>
                                        <span className='text-gray-600'>You've not shortened any links yet.</span>
                                    </div>
                                )}
                                {sortedLinks().map((link) => (
                                    <div
                                        key={link?.id}
                                        onClick={() => {
                                            setSelectedLink(link)
                                            setShowDetails(true)
                                        }} className={`hover:bg-gray-50 flex transition-all items-center justify-between px-6 py-4 border-b border-gray-200 first-letter:
                                            ${link.id === selectedLink?.id ? "md:bg-gray-100" : ""}
                                        `}>
                                        {/* text */}
                                        <div className='tracking-tight flex flex-col w-full space-y-1'>
                                            <span className='text-gray-700 text-lg font-medium tracking-tighter'>{link?.short_url.replace(/^https?:\/\//, '')}</span>
                                            <span className='text-gray-600'>{link?.name}</span>
                                            <span className='text-gray-500'>{moment(link?.created_at).format('LL')} <span className='text-[9px] relative bottom-0.5'>•</span> {moment(link?.created_at).format('LT')}</span>
                                        </div>
                                        {/* views */}
                                        <div className='flex flex-col items-center -space-y-0.5'>
                                            <span className='text-gray-500 font-medium'>{link?.click_count || 0}</span>
                                            <img className='w-5' src={eye} alt="" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* details section */}
                    <div className={`sm:w-[75vw] md:w-full h-fit md:pl-[53.4%] lg:pl-[43.85%] xl:pl-[31.2%] bg-white transition-all absolute md:flex md:static w-full
                        ${showDetails ? "left-0" : "left-[100vh]"}
                    `}>
                        {selectedLink ? (
                            <div className='w-full mb-16 md:mb-0'>
                                <div className='w-full'>
                                    {/* back button on mobile */}
                                    <div onClick={() => setShowDetails(false)} className='hover:bg-gray-100 transition-all md:hidden m-4 flex items-center p-3 border border-gray-200 w-fit rounded-md'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                        </svg>
                                        <span className='ml-1.5'>Go back</span>
                                    </div>
                                    {/* your link stats */}
                                    <div className='bg-gray-100 w-full py-8 px-6 text-gray-900'>
                                        <h1 className='text-xl font-medium'>Your link stats</h1>
                                        <div className='my-6 gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
                                            {/* click count */}
                                            <div className='bg-white rounded-md shadow p-6 space-y-6'>
                                                <div className='flex justify-between text-gray-500 '>
                                                    <span className='font-medium'>Link clicks</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </div>
                                                <h1 className='text-3xl font-bold'>{selectedLink?.click_count || 0}</h1>
                                            </div>

                                            {/* top click source */}
                                            <TopClickSource clickSource={selectedLink?.click_source} />

                                            {/* top location */}
                                            <div className='bg-white rounded-md shadow p-6 space-y-6'>
                                                <div className='flex justify-between text-gray-500 '>
                                                    <span className='font-medium'>Top location</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>

                                                </div>
                                                <h1 className='text-3xl font-bold'>{mostFrequentLocation || 'No data'}</h1>
                                            </div>
                                        </div>

                                    </div>
                                    {/* your link */}
                                    <div className='py-8 px-6 bg-gray-50/50 border-y'>
                                        <h1 className='text-xl font-medium'>Your link</h1>
                                        <div className='flex flex-col lg:flex-row my-6 gap-4'>
                                            {/* og image goes here */}
                                            <img className='object-cover w-full h-[210px] lg:h-auto md:w-[200px] rounded-md' src="https://www.pngkey.com/png/detail/233-2332677_image-500580-placeholder-transparent.png" alt="Placeholder Transparent@pngkey.com" />
                                            <div className='flex justify-between w-full'>
                                                <div className='flex flex-col w-11/12'>
                                                    <a href={selectedLink?.short_url} className='text-gray-700 hover:underline transition-all font-medium text-lg' target='_blank'>{selectedLink.short_url.replace(/^https?:\/\//, '')}</a>
                                                    <span className='text-gray-600'>{selectedLink.original_url}</span>
                                                    <span className='text-gray-600 text-[17px]'>{selectedLink.name}</span>
                                                    <EditLinkModal selectedLink={selectedLink} />
                                                </div>
                                                {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                                </svg> */}
                                                <div className="max-w-sm">
                                                    <Popover className="relative">
                                                        {() => (
                                                            <>
                                                                <Popover.Button>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                                                    </svg>
                                                                </Popover.Button>
                                                                <Transition
                                                                    as={Fragment}
                                                                    enter="transition ease-out duration-200"
                                                                    enterFrom="opacity-0 translate-y-1"
                                                                    enterTo="opacity-100 translate-y-0"
                                                                    leave="transition ease-in duration-150"
                                                                    leaveFrom="opacity-100 translate-y-0"
                                                                    leaveTo="opacity-0 translate-y-1"
                                                                >
                                                                    <Popover.Panel className="absolute -right-20 z-10 mt-3 w-screen max-w-[10rem] -translate-x-1/2 transform px-4 sm:px-0">
                                                                        <div className="p-1 bg-white flex flex-col overflow-hidden rounded-lg shadow-lg">
                                                                            <ShareLinkModal selectedLink={selectedLink} />
                                                                            <div className='h-px w-3/4 bg-gray-100 mx-auto'></div>
                                                                            <DeleteLinkModal selectedLink={selectedLink} />
                                                                        </div>
                                                                    </Popover.Panel>
                                                                </Transition>
                                                            </>
                                                        )}
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* qr code */}
                                    <QRCode shortUrl={selectedLink?.short_url} />
                                </div></div>

                        ) : (
                            <div className='text-center text-gray-700 w-full mt-12'>No data to show</div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}
export default Dashboard;