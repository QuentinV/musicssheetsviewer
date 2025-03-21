import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ListSheets } from '../components/ListSheets';

export const HomePage = () => {
    const navigate = useNavigate();
    return <>
        <div>
            <div>
                <h1 className='text-center'>Musics</h1>
                <ListSheets />
            </div>
            <div className='text-center'>
                <Button onClick={() => navigate('/upload')}>Upload</Button>
            </div>
        </div>
    </>
}