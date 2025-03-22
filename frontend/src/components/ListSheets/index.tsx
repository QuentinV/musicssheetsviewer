import React, { useState, useEffect } from 'react';
import { DataView } from 'primereact/dataview';

interface Sheet {
    id: string;
    title: string;
}

export const ListSheets = () => {
    const [sheets, setSheets] = useState<Sheet[]>([]);

    useEffect(() => {
        (async() => {
            const res = await fetch('/api/sheets');
            setSheets((await res.json()).data);
        })();
    }, []);

    const itemTemplate = ({ id, title }: Sheet) => {
        return (
            <div className="w-2 h-5rem p-2 flex flex-wrap font-bold justify-content-center align-items-center border-round border-1 surface-border hover:bg-primary cursor-pointer" key={id}>
                {title}
            </div>
        );
    };

    return (
        <div className="card p-5">
            <DataView value={sheets} itemTemplate={itemTemplate} />
        </div>
    )
}
        