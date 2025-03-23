import React, { useState, useEffect } from 'react';
import { DataView } from 'primereact/dataview';
import { useNavigate } from 'react-router-dom';

interface Sheet {
    uuid: string;
    title: string;
}

export const ListSheets = () => {
    const [sheets, setSheets] = useState<Sheet[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async() => {
            const res = await fetch('/api/sheets');
            setSheets((await res.json()).data);
        })();
    }, []);

    const itemTemplate = ({ uuid, title }: Sheet) => {
        return (
            <div 
                className="w-2 h-5rem m-2 p-2 flex flex-wrap font-bold justify-content-center align-items-center border-round border-1 surface-border hover:bg-primary cursor-pointer" 
                key={uuid}
                onClick={() => navigate(`/sheet/${uuid}`)}>
                {title ?? uuid}
            </div>
        );
    };

    return (
        <div className="card p-5">
            <DataView value={sheets} itemTemplate={itemTemplate} />
        </div>
    )
}
        