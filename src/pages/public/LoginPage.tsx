import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useActionState, useState } from 'react';
import { shemaLogin, type LoginFormValues } from '../../models';
import type { ActionState } from '../../interfaces';
import { createInitialState, hanleZodError } from '../../helpers';
import { useAlert, useAuth, useAxios } from '../../hooks';
import { Link, useNavigate } from 'react-router-dom';

export type LoginActionState = ActionState<LoginFormValues>;
const initialState = createInitialState<LoginFormValues>();
//const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const LoginPage = () => {
  const axios = useAxios();
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const loginApi = async (
    _: LoginActionState | undefined,
    formData: FormData
  ) => {
    const rawData: LoginFormValues = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };
    try {
      shemaLogin.parse(rawData);

      // Log the request data for debugging
      console.log('Login attempt with username:', rawData.username);

      try {
        const response = await axios.post('/login', {
          username: rawData.username,
          password: rawData.password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Login response:', response);

        if (!response?.data?.token) {
          throw new Error('No se recibió un token de autenticación');
        }

        login(response.data.token, { username: rawData.username });
        navigate('/perfil');
      } catch (error: any) {
        console.error('Login error:', error);
        console.error('Error response:', error.response?.data);

        let errorMessage = 'Error al iniciar sesión';
        if (error.response?.status === 403) {
          errorMessage = 'Acceso denegado. Usuario o contraseña incorrectos.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        showAlert(errorMessage, 'error');
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      const err = hanleZodError<LoginFormValues>(error, rawData);
      console.log('Validation error:', err);
      showAlert(err.message || 'Error de validación', 'error');
      return err;
    }
  };

  const [state, submitAction, isPending] = useActionState(
    loginApi,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show: boolean) => !show);

  return (
    <Container
      maxWidth={false}
      sx={{
        backgroundColor: '#242424',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: 'sm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component={'h1'} variant="h4" gutterBottom>
            LOGIN
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Proyecto Diplomado con React 19
          </Typography>

          {/* Alerta */}
          {Object.keys(state?.errors ?? {}).length !== 0 && (
            <Alert severity="error">{state?.message}</Alert>
          )}

          <Box action={submitAction} component={'form'} sx={{ width: '100%' }}>
            <TextField
              name="username"
              margin="normal"
              required
              fullWidth
              label="Username"
              autoComplete="username"
              autoFocus
              type="text"
              disabled={isPending}
              defaultValue={state?.formData?.username}
              error={!!state?.errors?.username}
              helperText={state?.errors?.username}
            />
            <TextField
              name="password"
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              disabled={isPending}
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
              defaultValue={state?.formData?.password}
              error={!!state?.errors?.password}
              helperText={state?.errors?.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isPending ? 'Cargando...' : 'Ingresar'}
            </Button>
            <Link to='/userRegister'>Registrar nuevo usuario</Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
