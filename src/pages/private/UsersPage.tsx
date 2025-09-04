import { Box } from '@mui/material';
import {
    UserDialog,
    UserFilter,
    UserHeader,
    UserTabla,
    type UserActionState,
} from '../../components';
import { useEffect, useState } from 'react';
import type { UserFilterDoneType, UserType } from '../../components/users/type';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useAlert, useAxios } from '../../hooks';
import { errorHelper, hanleZodError } from '../../helpers';
import { schemaUser } from '../../models';
import type { UserFormValues } from '../../models';

export const UsersPage = () => {
    const { showAlert } = useAlert();
    const axios = useAxios();

    const [filterStatus, setFilterStatus] = useState<UserFilterDoneType>('all');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<UserType[]>([]);
    const [total, setTotal] = useState(0);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 1,
        pageSize: 10,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        listUserApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, filterStatus, paginationModel, sortModel]);

    const listUserApi = async () => {
        try {
            const orderBy = sortModel[0]?.field;
            const orderDir = sortModel[0]?.sort;
            const params: any = {
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
                orderBy,
                orderDir,
                search
            };

            // Solo agregar el parámetro status si no es 'all'
            if (filterStatus !== 'all') {
                params.status = filterStatus === 'true' ? 'active' : 'inactive';
            }

            const response = await axios.get('/users', { params });
            setUsers(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            showAlert(errorHelper(error), 'error');
        }
    };

    const handleOpenCreateDialog = () => {
        setOpenDialog(true);
        setUser(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setUser(null);
    };

    const handleOpenEditDialog = (user: UserType) => {
        setOpenDialog(true);
        setUser(user);
    };

    const handleCreateEdit = async (
        _: UserActionState | undefined,
        formdata: FormData
    ) => {
        const rawData = {
            username: formdata.get('username') as string,
            password: formdata.get('password') as string,
            confirmPassword: formdata.get('confirmPassword') as string,
        };

        try {
            schemaUser.parse(rawData);
            if (user?.id) {
                await axios.put(`/users/${user.id}`, rawData);
                showAlert('Usuario editado', 'success');
            } else {
                await axios.post('/users', rawData);
                showAlert('Usuario creado', 'success');
            }
            listUserApi();
            handleCloseDialog();
            return;
        } catch (error) {
            const err = hanleZodError<UserFormValues>(error, rawData);
            showAlert(err.message, 'error');
            return err;
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const confirmed = window.confirm('¿Estas seguro de eliminar?');
            if (!confirmed) return;

            await axios.delete(`/users/${id}`);
            showAlert('Usuario eliminado', 'success');
            listUserApi();
        } catch (error) {
            showAlert(errorHelper(error), 'error');
        }
    };

    const handleDone = async (id: number, currentStatus: boolean) => {
        try {
            // First, fetch the current user data from the server
            const { data: currentUser } = await axios.get(`/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const newStatus = !currentStatus;
            const newStatusStr = newStatus ? 'active' : 'inactive';
            
            // Check if the status is already what we want to set
            if (currentUser.status === newStatusStr) {
                showAlert(`El usuario ya está ${newStatus ? 'activo' : 'inactivo'}`, 'info');
                return;
            }

            const action = newStatus ? 'activar' : 'desactivar';
            const confirmed = window.confirm(
                `¿Estás seguro de que quieres ${action} este usuario?`
            );
            if (!confirmed) return;

            console.log(`Toggling user ${id} status from ${currentUser.status} to:`, newStatusStr);
            
            // Update the UI optimistically
            const updatedUsers = users.map(user => 
                user.id === id 
                    ? { ...user, status: newStatusStr } 
                    : user
            );
            setUsers(updatedUsers);
            
            // Send the update to the server
            const payload = { status: newStatusStr };
            
            await axios.patch(
                `/users/${id}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            showAlert(`Usuario ${action}do correctamente`, 'success');
            listUserApi(); // Refresh the list to ensure consistency
                
        } catch (error: unknown) {
            console.error('Error updating user status:', error);
            listUserApi(); // Refresh the list to ensure UI consistency
            
            let errorMessage = 'Error al actualizar el estado del usuario. Por favor, intente nuevamente.';
            
            if (error && typeof error === 'object' && 'response' in error) {
                const response = error.response as any;
                
                if (response?.status === 409) {
                    errorMessage = 'El estado del usuario ha cambiado. Se ha actualizado la lista.';
                } else if (response?.status === 401) {
                    errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
                } else if (response?.status === 400) {
                    errorMessage = 'Solicitud incorrecta. Verifique los datos e intente nuevamente.';
                }
            }
            
            showAlert(errorMessage, 'error');
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header con titulo y boton agregar */}
            <UserHeader handleOpenCreateDialog={handleOpenCreateDialog} />

            {/* Barra de herramientas con filtros y busquedas */}
            <UserFilter
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                setSearch={setSearch}
            ></UserFilter>

            {/* Tabla */}
            <UserTabla
                users={users}
                rowCount={total}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
                sortModel={sortModel}
                setSortModel={setSortModel}
                handleDelete={handleDelete}
                handleDone={handleDone}
                handleOpenEditDialog={handleOpenEditDialog}
            />

            {/* Dialog */}
            <UserDialog
                open={openDialog}
                user={user}
                onClose={handleCloseDialog}
                handleCreateEdit={handleCreateEdit}
            />
        </Box>
    );
};
