const express = require('express');
const { pool } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Endpoint de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ 
    message: '¡Qué onda mi crack! Todo chido por aquí 😎',
    fecha: new Date().toLocaleString()
  });
});

// GET todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_usuario, nombre, correo, fecha_reg FROM usuarios');
    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// POST crear usuario (sin password en la respuesta por seguridad)
app.post('/api/usuarios', async (req, res) => {
  const { nombre, correo, password } = req.body;
  
  if (!nombre || !correo || !password) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos: nombre, correo y password son obligatorios'
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, correo, fecha_reg',
      [nombre, correo, password]
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });
  }
});

// Endpoint adicional para obtener usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, correo, fecha_reg FROM usuarios WHERE id_usuario = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET  /api/saludo`);
  console.log(`   GET  /api/usuarios`);
  console.log(`   POST /api/usuarios`);
  console.log(`   GET  /api/usuarios/:id`);
});