CREATE DATABASE MenuDB;
GO

USE MenuDB;
GO


CREATE TABLE Categoria (
    Id INT PRIMARY KEY IDENTITY,
    Nombre VARCHAR(50)
);

CREATE TABLE Producto (
    Id INT PRIMARY KEY IDENTITY,
    Nombre VARCHAR(100),
    CategoriaId INT,
    FOREIGN KEY (CategoriaId) REFERENCES Categoria(Id)
);

CREATE TABLE DetalleProducto (
    Id INT PRIMARY KEY IDENTITY,
    ProductoId INT,
    Descripcion VARCHAR(255),
    Precio DECIMAL(10,2),
    FOREIGN KEY (ProductoId) REFERENCES Producto(Id)
);

CREATE TABLE Imagen (
    Id INT PRIMARY KEY IDENTITY,
    ProductoId INT,
    Url VARCHAR(255),
    FOREIGN KEY (ProductoId) REFERENCES Producto(Id)
);

CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Usuarios (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Contra NVARCHAR(255) NOT NULL,
    RolId INT NOT NULL,
    FechaRegistro DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RolId) REFERENCES Roles(Id)
);

SELECT * FROM Imagen;
SELECT * FROM DetalleProducto;
SELECT * FROM Producto;
SELECT * FROM Roles;
SELECT * FROM Usuarios;
SELECT * FROM Categoria;


INSERT INTO Categoria (Nombre) VALUES ('fuertes');
INSERT INTO Categoria (Nombre) VALUES ('entradas');
INSERT INTO Categoria (Nombre) VALUES ('bebidas');
INSERT INTO Categoria (Nombre) VALUES ('postres');


INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Hamburguesa', 1);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Tacos', 1);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Pizza', 1);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Nachos', 2);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Ensalada', 2);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Refresco', 3);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Agua fresca', 3);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Pastel', 4);
INSERT INTO Producto (Nombre, CategoriaId) VALUES ('Helado', 4);



INSERT INTO DetalleProducto (ProductoId, Descripcion, Precio) VALUES
(1, 'Hamburguesa jugosa con pan suave, carne sazonada y acompañada de ingredientes frescos. Ideal para saciar el hambre con sabor.', 90),

(2, 'Tacos tradicionales, preparados con tortillas suaves y rellenos de ingredientes frescos y bien sazonados. Perfectos para disfrutar como plato principal.', 80),

(3, 'Pizza recién horneada con ingredientes frescos y queso derretido. Perfecta para compartir o disfrutar como plato principal.', 120),

(4, 'Nachos crujientes acompañados de queso derretido y toppings al gusto. Perfectos como entrada o snack para compartir.', 50),

(5, 'Ensalada fresca y saludable, preparada con ingredientes naturales. Ideal como entrada ligera o acompañamiento.', 45),

(6, 'Refresco frío y burbujeante, disponible en distintos sabores. Ideal para acompañar tu comida o refrescarte en cualquier momento.', 25),

(7, 'Bebida natural y refrescante, elaborada con frutas frescas, agua purificada y un toque suave de dulzor. Ideal para hidratarte y acompañar cualquier comida.', 20),

(8, 'Pastel suave y esponjoso, elaborado con ingredientes de calidad y un delicioso toque dulce. Perfecto para disfrutar como postre.', 40),

(9, 'Helado cremoso y refrescante, disponible en distintos sabores. Perfecto para disfrutar como postre o capricho dulce.', 35);

INSERT INTO Imagen (ProductoId, Url) VALUES
(1, 'ham.png'),
(2, 'tacos.jpg'),
(3, 'pizza.png'),
(4, 'nachos.png'),
(5, 'enzalada.png'),
(6, 'refresco.png'),
(7, 'agua.png'),
(8, 'pastel.png'),
(9, 'helado.png');


INSERT INTO Roles (Nombre) VALUES ('admin'), ('usuario');

INSERT INTO Usuarios (Nombre, Email, Contra, RolId)
VALUES ('Juan Perez', 'juan@gmail.com', '123456J@', 2);

INSERT INTO Usuarios (Nombre, Email, Contra, RolId)
VALUES ('admin', 'admin@gmail.com', '123456A@', 1);




ALTER TABLE DetalleProducto
DROP CONSTRAINT FK_DetalleProducto_Producto;

ALTER TABLE DetalleProducto
ADD CONSTRAINT FK_DetalleProducto_Producto
FOREIGN KEY (ProductoId)
REFERENCES Producto(Id)
ON DELETE CASCADE;


ALTER TABLE Imagen
DROP CONSTRAINT FK__Imagen__Producto__52593CB8;

ALTER TABLE Imagen
ADD CONSTRAINT FK_Imagen_Producto
FOREIGN KEY (ProductoId)
REFERENCES Producto(Id)
ON DELETE CASCADE;


SELECT name 
FROM sys.foreign_keys 
WHERE parent_object_id = OBJECT_ID('DetalleProducto');