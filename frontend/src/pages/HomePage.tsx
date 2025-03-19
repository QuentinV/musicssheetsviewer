import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ListSheets } from '../components/ListSheets';

export const HomePage = () => {
    const navigate = useNavigate();
    return <>
        <div>
            <div className='flex justify-content-center'>
                <h1>Musics</h1>
                <ListSheets />
            </div>
            <div className='text-center'>
                <Button onClick={() => navigate('/upload')}>Upload</Button>
            </div>
        </div>
    </>
}