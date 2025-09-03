import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
    type GridRenderCellParams,
} from '@mui/x-data-grid';
import type { UserType } from './type';
import { Box, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import {
    Edit as EditIcon,
    Undo as UndoIcon,
    Done as DoneIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import type { GridSortModel } from '@mui/x-data-grid';

interface Props {
    users: UserType[];
    rowCount: number;
    paginationModel: GridPaginationModel;
    setPaginationModel: (model: GridPaginationModel) => void;
    sortModel: GridSortModel;
    setSortModel: (model: GridSortModel) => void;
    handleDelete: (id: number) => void;
    handleDone: (id: number, done: boolean) => void;
    handleOpenEditDialog: (user: UserType) => void;
}

export const UserTabla = ({
    users,
    rowCount,
    paginationModel,
    setPaginationModel,
    setSortModel,
    sortModel,
    handleDelete,
    handleDone,
    handleOpenEditDialog
}: Props) => {
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'username', headerName: 'Usuario', flex: 1 },
        {
            field: 'status',
            headerName: 'Estado',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value === true ? 'Activo' : 'Inactivo'}
                    color={params.value === true ? 'success' : 'warning'}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            sortable: false,
            filterable: false,
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction={'row'} spacing={1}>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEditDialog(params.row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip
                        title={
                            params.row.status === true ? 'Desactivar usuario' : 'Activar usuario'
                        }
                    >
                        <IconButton
                            size="small"
                            color={params.row.status === true ? 'warning' : 'success'}
                            onClick={() => handleDone(params.row.id, !params.row.status)}
                        >
                            {params.row.status === true ? (
                                <UndoIcon fontSize="small" />
                            ) : (
                                <DoneIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(params.row.id)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ];

    return (
        <Box height={545}>
            <DataGrid
                rows={users}
                columns={columns}
                rowCount={rowCount}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                sortingMode={'server'}
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                pageSizeOptions={[5, 10, 20]}
                disableColumnFilter
            />
        </Box>
    );
};
