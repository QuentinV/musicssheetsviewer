import React, { useEffect, useRef, useState } from 'react';
import { IOSMDOptions, OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'
import { Dialog } from 'primereact/dialog'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

interface SheetRendererProps {
    id: string;
    title?: string;
}

export const SheetRenderer: React.FC<SheetRendererProps> = ({ id, title }) => {
    const toast = useRef<Toast>(null);
    const [osmd, setOsmd] = useState<OSMD|null>(null);
    const ref = useRef(null);
    const [options, setOptions] = useState<IOSMDOptions>({ coloringMode: 0, drawTitle: false });
    const [titleState, setTitle] = useState<string>(title ?? '');
    const [dialogEditVisible, setDialogEditVisible] = useState<boolean>(false);

    useEffect(() => {
        if ( !ref.current || osmd ) {
            return;
        }
        (async () => {
            const osmd = new OSMD(ref.current as any, { autoResize: true });
            osmd.setOptions(options);
            await osmd.load(`/api/sheets/${id}/book.mxl`, id);
            await osmd.render();
            setOsmd(osmd);
            setOptions(options);
        })();      
    }, [ref.current, id]);

    useEffect(() => {
        if (!osmd) {
            return;
        }
        osmd.setOptions(options);
        osmd.render();
    }, [options, osmd]);

    const updateTitle = async () => {
        await fetch(`/api/sheets/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title: titleState }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        setDialogEditVisible(false);
    };
    
    const confirmDelete = (event: React.MouseEvent<HTMLElement>) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Are you sure you want to proceed?',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: () => {
                fetch(`/api/sheets/${id}`, { method: 'DELETE'})
                .then(() => {
                    toast?.current?.show({ severity: 'info', summary: 'Success', detail: 'File removed' });
                });
            },
            reject: () => {
                //
            }
        });
    }

    return (<>
        <div className='justify-content-end mr-5 flex gap-4 mt-2 text-xl'>
            <i className='pi pi-moon cursor-pointer hover:text-primary' onClick={() => setOptions({ ...options, darkMode: !options.darkMode })}></i>
            <i className='pi pi-palette cursor-pointer hover:text-primary' onClick={() => setOptions({ ...options, coloringMode: options.coloringMode === 1 ? 0 : 1 })}></i>
        </div>
        <h1 className='text-center'>
            {titleState}
            <i className='pi pi-pencil ml-2 text-sm cursor-pointer' onClick={() => setDialogEditVisible(true)} />
            <i className='pi pi-times ml-2 text-sm cursor-pointer' onClick={confirmDelete} />
        </h1>
        <div ref={ref}></div>v
        <Dialog onHide={() => updateTitle()} header='Edit Title' visible={dialogEditVisible} showHeader={false} dismissableMask={true}>
            <div className='flex flex-column gap-3 mt-4'>
                <InputText placeholder='Title' value={titleState} onChange={(e) => setTitle(e.target.value)} className='p-inputtext-sm' />
            </div>
        </Dialog>
        <ConfirmPopup />
        <Toast ref={toast}></Toast>
    </>)
};