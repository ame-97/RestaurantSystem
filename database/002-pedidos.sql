-- 002-pedidos.sql
-- Migración idempotente: crea las tablas Pedido y DetallePedido y los usuarios
-- semilla si aún no existen. Se puede ejecutar varias veces sin error.
--
-- Uso: sqlcmd -S . -E -d MenuDB -i database\002-pedidos.sql
--
-- Contexto: BD-Menu.sql no se puede volver a correr completo sobre una base ya
-- creada (falla en CREATE DATABASE y en un DROP CONSTRAINT con nombre
-- autogenerado). Este script cubre lo que le falta a una MenuDB existente.

USE MenuDB;
GO

IF OBJECT_ID('dbo.Pedido', 'U') IS NULL
BEGIN
    CREATE TABLE Pedido (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId INT NOT NULL,

        TipoPedido NVARCHAR(20) NOT NULL
            CHECK (TipoPedido IN ('Para llevar','A domicilio')),

        Direccion NVARCHAR(250) NULL,

        Latitud DECIMAL(10,7) NULL,

        Longitud DECIMAL(10,7) NULL,

        MetodoPago NVARCHAR(30) NOT NULL
            CHECK (MetodoPago IN ('Efectivo','Tarjeta al recibir','Tarjeta simulada')),

        EstadoPago NVARCHAR(20) NOT NULL
            DEFAULT 'Pendiente'
            CHECK (EstadoPago IN ('Pendiente','Pagado')),

        Total DECIMAL(10,2) NOT NULL,

        Fecha DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Pedido_Usuario
            FOREIGN KEY (UsuarioId)
            REFERENCES Usuarios(Id)
    );

    PRINT 'Tabla Pedido creada.';
END
ELSE
    PRINT 'Tabla Pedido ya existe, sin cambios.';
GO

IF OBJECT_ID('dbo.DetallePedido', 'U') IS NULL
BEGIN
    CREATE TABLE DetallePedido (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        PedidoId INT NOT NULL,

        ProductoId INT NOT NULL,

        Cantidad INT NOT NULL,

        PrecioUnitario DECIMAL(10,2) NOT NULL,

        Subtotal DECIMAL(10,2) NOT NULL,

        CONSTRAINT FK_DetallePedido_Pedido
            FOREIGN KEY (PedidoId)
            REFERENCES Pedido(Id)
            ON DELETE CASCADE,

        CONSTRAINT FK_DetallePedido_Producto
            FOREIGN KEY (ProductoId)
            REFERENCES Producto(Id)
    );

    PRINT 'Tabla DetallePedido creada.';
END
ELSE
    PRINT 'Tabla DetallePedido ya existe, sin cambios.';
GO

-- Usuarios semilla de BD-Menu.sql (contraseñas en texto plano, igual que el
-- script original: el login compara directo contra la columna Contra).
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'juan@gmail.com')
BEGIN
    INSERT INTO Usuarios (Nombre, Email, Contra, RolId)
    VALUES ('Juan Perez', 'juan@gmail.com', '123456J@',
            (SELECT Id FROM Roles WHERE Nombre = 'usuario'));

    PRINT 'Usuario juan@gmail.com creado.';
END
ELSE
    PRINT 'Usuario juan@gmail.com ya existe, sin cambios.';
GO

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'admin@gmail.com')
BEGIN
    INSERT INTO Usuarios (Nombre, Email, Contra, RolId)
    VALUES ('admin', 'admin@gmail.com', '123456A@',
            (SELECT Id FROM Roles WHERE Nombre = 'admin'));

    PRINT 'Usuario admin@gmail.com creado.';
END
ELSE
    PRINT 'Usuario admin@gmail.com ya existe, sin cambios.';
GO
