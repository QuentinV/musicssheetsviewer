import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { UploadSheets } from '../components/UploadSheets';

export const UploadPage = () => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-column justify-content-center p-5 text-center gap-2'>
            <h1>Upload</h1>
            <div>
                <UploadSheets />
            </div>
            <div>
                <Button onClick={() => navigate('/')}>Back</Button>
            </div>
        </div>
    );
};