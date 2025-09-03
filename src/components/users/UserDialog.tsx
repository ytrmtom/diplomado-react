import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { UserType } from './type';
import { useActionState } from 'react';
import type { ActionState } from '../../interfaces';
import type { UserFormValues } from '../../models';
import { createInitialState } from '../../helpers';
import { useState } from 'react';

export type UserActionState = ActionState<UserFormValues>;

interface Props {
    open: boolean;
    user?: UserType | null;
    onClose: () => void;
    handleCreateEdit: (
        _: UserActionState | undefined,
        formData: FormData
    ) => Promise<UserActionState | undefined>;
}

export const UserDialog = ({ onClose, open, user, handleCreateEdit }: Props) => {
    const initialState = createInitialState<UserFormValues>();

    const [state, submitAction, isPending] = useActionState(
        handleCreateEdit,
        initialState
    );
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    return (
        <Dialog open={open} onClose={onClose} maxWidth={'sm'} fullWidth>
            <DialogTitle>{user ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <Box key={user?.id ?? 'new'} component={'form'} action={submitAction}>
                <DialogContent>
                    <TextField
                        name="username"
                        autoFocus
                        margin="dense"
                        label="Nombre de usuario"
                        fullWidth
                        required
                        variant="outlined"
                        disabled={isPending}
                        defaultValue={state?.formData?.username || user?.username || ''}
                        error={!!state?.errors?.username}
                        helperText={state?.errors?.username}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        name="password"
                        autoFocus
                        margin="dense"
                        label="Contraseña"
                        fullWidth
                        required
                        variant="outlined"
                        type={showPassword ? 'text' : 'password'}
                        disabled={isPending}
                        defaultValue={state?.formData?.password || user?.password || ''}
                        error={!!state?.errors?.password}
                        helperText={state?.errors?.password}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        name="confirmPassword"
                        autoFocus
                        margin="dense"
                        label="Confirmar contraseña"
                        fullWidth
                        required
                        variant="outlined"
                        type={showConfirmPassword ? 'text' : 'password'}
                        disabled={isPending}
                        defaultValue={state?.formData?.confirmPassword || user?.password || ''}
                        error={!!state?.errors?.confirmPassword}
                        helperText={state?.errors?.confirmPassword}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm password visibility"
                                        onClick={handleClickShowConfirmPassword}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isPending}
                        startIcon={isPending ? <CircularProgress /> : null}
                    >
                        {user ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};