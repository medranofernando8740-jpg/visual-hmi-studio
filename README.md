# HMI Forge

Prompt maestro para Lovable: Frontend profesional de Editor Visual HMI/Industrial para Microcontroladores

Quiero que construyas el frontend completo de una aplicación web moderna llamada provisionalmente HMI Studio.

La aplicación es un editor visual de interfaces industriales, HMI y simulación para microcontroladores. Conceptualmente debe tener una filosofía similar a un editor visual tipo EEZ Studio, con algunas ideas de LabVIEW en cuanto a comunicación y variables, pero la experiencia principal debe estar centrada en la creación visual de interfaces mediante drag & drop.

OBJETIVO PRINCIPAL

El usuario debe poder crear interfaces gráficas interactivas para:

Arduino.

ESP32.

Otros microcontroladores.

Simuladores.

Sistemas seriales.

Sistemas industriales futuros.

Dashboards y HMIs.

El sistema debe permitir crear interfaces utilizando widgets simples y también importar diseños industriales creados previamente en programas como Adobe Illustrator, Inkscape u otros editores vectoriales.

El enfoque principal es que el usuario pueda importar un archivo SVG, visualizar su estructura interna y seleccionar elementos individuales o grupos para convertirlos en elementos interactivos y animados.

Por ejemplo, un usuario puede diseñar un ventilador industrial en Illustrator y dividirlo en partes:

carcasa

motor

aspas

eje

indicador luminoso

etiqueta

Después exporta el diseño como SVG.

Dentro de la aplicación, el usuario debe poder seleccionar el grupo correspondiente a las aspas y asignarle comportamientos:

Girar.

Girar solamente cuando una variable sea verdadera.

Cambiar velocidad según una variable numérica.

Cambiar dirección.

Ocultarse o mostrarse.

Cambiar color.

Aplicar opacidad.

El mismo concepto debe funcionar para bombas, motores, bandas transportadoras, válvulas, tanques, luces, sensores y cualquier otro equipo mecánico, eléctrico o industrial.

ARQUITECTURA VISUAL DE LA APLICACIÓN

La interfaz principal debe ser similar a un IDE o software de diseño profesional.

Debe tener:

1. Barra superior

Incluir:

Logo y nombre HMI Studio.

Selector de proyecto.

Guardar.

Deshacer.

Rehacer.

Vista previa / Preview.

Modo diseño.

Modo simulación.

Indicador de conexión.

Botón de configuración.

2. Panel izquierdo: Biblioteca

Debe tener pestañas o secciones:

Elementos básicos

Texto.

Entrada de texto.

Número.

Rectángulo.

Círculo.

Línea.

Imagen.

SVG.

Grupo.

Indicadores

Luz indicadora.

LED.

Valor numérico.

Barra de progreso.

Gauge.

Medidor circular.

Termómetro.

Gráfica.

Controles

Botón.

Switch.

Slider.

Selector.

Entrada numérica.

Equipos

Debe existir una biblioteca visual preparada para contener widgets reutilizables:

Motores.

Bombas.

Ventiladores.

Bandas transportadoras.

Válvulas.

Tanques.

Sensores.

Inversores.

Equipos solares.

Inicialmente estos pueden ser ejemplos o placeholders visuales, pero la arquitectura debe permitir agregar widgets personalizados.

También debe existir un botón:

Importar SVG

3. Área central: Canvas

Esta es el área principal de diseño.

Debe permitir:

Drag and drop.

Seleccionar objetos.

Selección múltiple.

Mover.

Redimensionar.

Rotar.

Zoom.

Pan.

Grid.

Snap to grid.

Guías de alineación.

Alinear elementos.

Agrupar.

Desagrupar.

Ordenar capas.

Bloquear elementos.

Ocultar elementos.

El canvas debe tener un aspecto profesional y limpio, similar a un software de diseño o HMI.

No quiero un diseño tipo página web convencional. Debe sentirse como una herramienta profesional.

4. Panel derecho: Inspector de propiedades

Cuando se selecciona un elemento, mostrar sus propiedades.

Propiedades generales

ID.

Nombre.

Posición X/Y.

Ancho.

Alto.

Rotación.

Opacidad.

Visibilidad.

Color.

Bordes.

Las propiedades deben mostrarse de forma dinámica dependiendo del tipo de elemento seleccionado.

SISTEMA DE SVG Y CAPAS

Este es uno de los puntos más importantes.

Cuando el usuario importe un SVG, el sistema debe analizar su estructura visual y mostrar un árbol de elementos.

Ejemplo:

VENTILADOR_01.svg

Fan Group

Motor Body

Rotor

Blade 1

Blade 2

Blade 3

Shaft

Status Light

Label

El usuario debe poder seleccionar cualquier elemento desde:

Directamente en el canvas.

Desde el árbol de capas.

Al seleccionar un elemento del SVG, debe poder asignarle propiedades y comportamientos.

La interfaz debe mostrar claramente cuál elemento está seleccionado mediante un borde o highlight.

IMPORTANTE:

El diseño debe estar preparado para trabajar principalmente con SVG, grupos SVG e identificadores de elementos.

PANEL DE CAPAS

Agregar una sección inferior o lateral llamada:

Capas

Debe mostrar la jerarquía completa:

Screen

SVG Fan

Motor

Rotor

Blade

Light

Text

Button

Cada capa debe permitir:

Seleccionar.

Renombrar.

Ocultar.

Mostrar.

Bloquear.

Desbloquear.

Reordenar mediante drag and drop.

SISTEMA DE BINDINGS

Cada propiedad importante debe poder tener un valor:

Fijo.

Asociado a una variable.

Asociado a una expresión.

Controlado mediante una condición.

Al seleccionar una propiedad debe existir un botón o icono para conectar la propiedad a una variable.

Ejemplo:

Rotation:

Fixed value: 0°

Variable: fan.speed

Expression: fan.speed * 0.1

Visibilidad:

Fixed: true

Condition: pump.running == true

Color:

Normal: verde.

Condición alarma: rojo.

PANEL DE VARIABLES

Debe existir un panel llamado:

Variables / Tags

El usuario puede crear variables de diferentes tipos:

Boolean.

Number.

String.

Ejemplos:

FAN_RUNNING → Boolean.

FAN_SPEED → Number.

MOTOR_ALARM → Boolean.

TEMPERATURE → Number.

PUMP_STATUS → Boolean.

Cada variable debe mostrar:

Nombre.

Tipo.

Valor actual.

Fuente.

Estado de conexión.

Para el MVP, utilizar datos simulados en frontend.

SISTEMA DE ANIMACIONES

Cada elemento debe poder tener comportamientos y animaciones.

Crear un panel:

Comportamientos

El usuario puede agregar reglas.

Ejemplo:

CUANDO:

FAN_RUNNING == true

HACER:

Rotación continua

Propiedades:

Dirección.

Velocidad.

Duración.

Loop.

Otros comportamientos:

Rotación

Clockwise.

Counter-clockwise.

Velocidad fija.

Velocidad basada en variable.

Movimiento

Horizontal.

Vertical.

Movimiento basado en variable.

Color

Cambio directo.

Cambio condicionado.

Visibilidad

Mostrar.

Ocultar.

Opacidad

Cambiar según valor.

Parpadeo

Ejemplo:

Si:

ALARM == true

Entonces:

Luz roja.

Parpadeo continuo.

EJEMPLOS DE INTERACCIÓN

Ejemplo 1: Ventilador

El usuario importa un SVG de ventilador.

Selecciona el grupo:

ROTOR

Configura:

Variable: FAN_RUNNING

Condición:

FAN_RUNNING == true

Acción:

Rotar continuamente.

Velocidad:

Variable FAN_SPEED.

En modo simulación, al cambiar FAN_RUNNING a true, las aspas deben comenzar a girar visualmente.

Ejemplo 2: Luz

Seleccionar un círculo.

Configurar estados:

false → gris.

true → verde.

alarm → rojo y parpadeante.

Ejemplo 3: Banda transportadora

Seleccionar el patrón de una banda.

Configurar:

Variable CONVEYOR_RUNNING.

Movimiento horizontal infinito.

Dirección configurable.

Velocidad vinculada a CONVEYOR_SPEED.

MODO SIMULACIÓN

Agregar un modo:

Simulation Mode

En este modo, el usuario puede modificar las variables manualmente y observar en tiempo real las animaciones y cambios de la interfaz.

Debe existir un panel de simulación donde pueda:

Activar/desactivar Boolean.

Cambiar números mediante sliders.

Escribir valores.

Activar alarmas.

Por ejemplo:

FAN_RUNNING: ON

FAN_SPEED: 1200 RPM

ALARM: OFF

Los widgets y elementos visuales deben reaccionar inmediatamente.

PREVIEW MODE

Agregar un modo de pantalla limpia.

En Preview:

Ocultar paneles de edición.

Mostrar únicamente la HMI creada.

Las animaciones deben continuar funcionando.

Las variables simuladas deben actualizar la interfaz.

SISTEMA DE WIDGETS REUTILIZABLES

Debe existir el concepto de:

Crear Widget desde selección

El usuario puede seleccionar varios elementos, agruparlos y guardarlos como un widget reutilizable.

Ejemplo:

Selecciona:

Motor.

Rotor.

Luz.

Texto.

Guardar como:

Motor Industrial

El widget debe aparecer posteriormente en la biblioteca para poder arrastrarlo nuevamente.

El widget debe poder tener variables expuestas:

Running.

Speed.

Alarm.

Cuando se usa una instancia del widget, el usuario debe poder conectar esas variables a otras variables globales.

ESTRUCTURA VISUAL

Quiero una interfaz moderna y profesional.

Características:

Tema oscuro como predeterminado.

Diseño tipo software industrial/IDE.

Bordes discretos.

Buena jerarquía visual.

Iconos claros.

Paneles redimensionables.

Canvas central amplio.

Interfaz responsive en resoluciones grandes.

No quiero una interfaz excesivamente decorativa. La prioridad es funcionalidad y claridad.

TECNOLOGÍAS FRONTEND

Utilizar:

React.

TypeScript.

Componentes reutilizables.

Tailwind CSS.

Arquitectura modular.

Estado centralizado.

Preparar el código para conectarse posteriormente a una API Laravel.

Crear una capa de servicios o API mock para que posteriormente pueda sustituirse por Laravel sin modificar toda la interfaz.

IMPORTANTE: NO IMPLEMENTAR BACKEND REAL TODAVÍA

Por ahora crear solamente el frontend, utilizando:

Datos simulados.

Local state.

LocalStorage si es necesario.

Mock services.

La aplicación debe quedar preparada para que posteriormente se conecte a Laravel.

ESTRUCTURA DEL PROYECTO

Organizar los componentes de manera clara, por ejemplo:

components/editor

components/canvas

components/inspector

components/layers

components/widgets

components/variables

components/behaviors

components/simulation

services

stores

types

ENTREGABLE DEL MVP

Quiero una primera versión funcional donde sea posible:

Crear una pantalla.

Agregar elementos básicos.

Importar y mostrar un SVG.

Mostrar las capas/grupos del SVG.

Seleccionar elementos individuales.

Mover y redimensionar elementos.

Editar propiedades.

Crear variables simuladas.

Conectar variables a propiedades.

Crear al menos rotación, cambio de color, visibilidad y parpadeo.

Ejecutar un modo simulación.

Crear widgets reutilizables.

La prioridad absoluta es construir una base sólida y extensible.

No simplifiques el concepto a un simple dashboard. La aplicación debe sentirse como un editor visual de interfaces HMI y simulación para microcontroladores, donde el usuario puede construir equipos gráficos interactivos a partir de elementos vectoriales y posteriormente conectarlos a variables y comunicaciones reales.

En futuras versiones se integrarán:

Puerto serial de la PC.

Arduino.

ESP32.

Web Serial API.

MQTT.

Modbus.

OPC-UA.

WebSockets.

Por ahora, prepara visual y arquitectónicamente el frontend para estas futuras integraciones, pero utiliza una fuente de datos simulada.

ALCANCE AMPLIADO: EL FRONTEND DEBE SER UN IDE PROFESIONAL

No construyas una simple página de dashboard ni un CRUD visual. Quiero el cascarón frontend de una aplicación profesional de ingeniería, con una experiencia visual inspirada en herramientas como LabVIEW, EEZ Studio, Figma, Adobe Illustrator y editores HMI/SCADA profesionales.

El frontend debe estar preparado para que posteriormente yo conecte Laravel como backend y un motor de comunicación/compilación para microcontroladores. El objetivo es que la arquitectura visual no tenga que rehacerse cuando se incorporen esas funciones.

BIBLIOTECA DE WIDGETS Y CONTROLES

La biblioteca inicial debe ser amplia y cubrir categorías equivalentes a las habituales en herramientas de HMI/embedded GUI, además de controles industriales.

Display y texto

Label / texto.

Texto multilínea.

Rich text básico.

Numeric display.

Decimal display.

Integer display.

Counter.

Clock.

Date/time.

Status text.

Dynamic text.

Text input.

Numeric input.

Password input.

Controles

Button.

Toggle button.

Switch.

Checkbox.

Radio button.

Slider.

Vertical slider.

Knob.

Rotary control.

Spinbox.

Numeric stepper.

Dropdown.

Combo box.

List.

Tabs.

Menu.

Keyboard.

Joystick/control pad.

Indicadores

LED.

Pilot light.

Progress bar.

Vertical progress bar.

Circular progress.

Gauge.

Analog meter.

Thermometer.

Battery indicator.

Level indicator.

Bar graph.

Numeric gauge.

Status indicator.

Gráficas y datos

Line chart.

Area chart.

Bar chart.

XY plot.

Real-time trend.

Histogram.

Table.

Data grid.

Alarm list.

Event list.

Multimedia y gráficos

Image.

SVG.

Icon.

Vector shape.

Rectangle.

Rounded rectangle.

Circle.

Ellipse.

Line.

Polyline.

Polygon.

Arc.

Path.

Group.

Frame/panel.

Container.

Todos estos elementos deben poder editarse visualmente y, cuando tenga sentido, recibir bindings, condiciones, estados y animaciones.

EDITOR DE FORMAS Y ELEMENTOS DINÁMICOS

No limitar el sistema a widgets prediseñados.

El usuario debe poder crear un rectángulo, círculo, línea, polígono, path o grupo y convertirlo en un elemento dinámico.

Ejemplo: un rectángulo puede representar el nivel de un tanque.

Propiedad:

height = tank.level

O:

fill = tank.level

El sistema debe permitir definir:

Valor mínimo.

Valor máximo.

Escala.

Dirección de llenado.

Punto de origen.

Color por rango.

Opacidad por rango.

Animación temporal.

Curvas o interpolación.

Ejemplo: tanque

Crear un rectángulo como líquido.

Variable:

TANK_LEVEL

Rango:

0 - 100 %

Acción:

Cambiar progresivamente la altura del rectángulo.

También permitir:

TANK_LEVEL < 20 → rojo

20 <= TANK_LEVEL < 50 → amarillo

TANK_LEVEL >= 50 → verde

El usuario debe poder construir este tipo de widget sin escribir código.

MOTOR DE ANIMACIONES

Crear una arquitectura de animaciones general, no limitada a ventiladores.

Cada elemento debe poder tener múltiples comportamientos simultáneos.

Tipos de animación:

Rotate.

Translate X.

Translate Y.

Scale.

Opacity.

Color transition.

Fill level.

Width change.

Height change.

Progress.

Blink.

Pulse.

Shake.

Flash.

Path movement.

Frame/state animation.

Continuous animation.

One-shot animation.

Ping-pong animation.

Debe existir una interfaz visual para agregar comportamientos y configurar sus parámetros.

SISTEMA DE ESTADOS

Los widgets deben poder tener estados visuales.

Ejemplo para motor:

OFF.

STARTING.

RUNNING.

STOPPING.

ALARM.

FAULT.

Cada estado puede modificar:

Color.

Imagen/SVG mostrado.

Animación.

Texto.

Visibilidad.

Opacidad.

Sonido futuro.

IMPORTACIÓN AVANZADA DE SVG

El importador SVG debe considerarse una funcionalidad central.

Al importar un SVG:

Leer grupos.

Leer IDs.

Leer nombres.

Construir árbol de capas.

Mantener transformaciones.

Permitir seleccionar cada grupo.

Permitir renombrar grupos.

Permitir convertir un grupo en elemento interactivo.

Permitir asignar bindings.

Permitir asignar animaciones.

Debe existir una herramienta para identificar visualmente un elemento al seleccionarlo en el árbol.

El sistema debe conservar la estructura SVG tanto como sea posible para permitir exportación posterior.

CREACIÓN DE WIDGETS PROFESIONALES

El usuario debe poder crear un widget compuesto a partir de cualquier selección.

Ejemplo:

Seleccionar:

carcasa.

rotor.

eje.

luz.

etiqueta.

Crear widget:

Industrial Fan

Definir propiedades públicas:

Running.

Speed.

Direction.

Alarm.

Color.

Estas propiedades deben aparecer cuando una instancia del widget sea seleccionada.

El widget debe poder guardarse en una biblioteca personalizada.

INSTANCIAS Y PARÁMETROS

Una vez creado un widget, cada instancia debe poder tener parámetros independientes.

Ejemplo:

Fan_01

Running → PLC.FAN01.RUN

Speed → PLC.FAN01.SPEED

Fan_02

Running → PLC.FAN02.RUN

Speed → PLC.FAN02.SPEED

El diseño del widget debe permanecer reutilizable.

EDITOR DE EXPRESIONES Y LÓGICA VISUAL

Crear un sistema visual para condiciones y expresiones.

Debe permitir operadores:

==

!=

<

=

<=

AND

OR

NOT

Y funciones matemáticas básicas.

Ejemplos:

speed > 1000

motor.running && motor.alarm == false

temperature * 1.8 + 32

El sistema debe tener un editor visual y, opcionalmente, un modo avanzado de expresión.

TEMPORIZADORES Y EVENTOS

Debe existir soporte conceptual para:

Timer.

Delay.

Periodic event.

On change.

On true.

On false.

On click.

On value change.

Startup.

Shutdown.

Ejemplo:

Al activar una bomba:

WAIT 2 seconds → activar válvula

Esto inicialmente puede ser simulado completamente en frontend.

SISTEMA DE SIMULACIÓN

El modo simulación debe parecer un laboratorio de pruebas.

Debe permitir crear señales simuladas:

Boolean.

Constant.

Ramp.

Sine wave.

Triangle wave.

Square wave.

Random.

Counter.

Timer.

Manual slider.

Ejemplo:

MOTOR_SPEED = sine wave 0-1800 RPM

Esto permitirá probar animaciones antes de conectar hardware real.

MONITOR DE VARIABLES

Crear una ventana/panel profesional tipo watch window.

Mostrar:

Variable.

Tipo.

Valor.

Unidad.

Fuente.

Timestamp.

Calidad/estado.

Permitir fijar variables favoritas.

ARQUITECTURA DE COMUNICACIÓN FUTURA

Aunque el backend y drivers reales se implementarán posteriormente, el frontend debe crear desde ahora las interfaces visuales necesarias para soportarlos.

Crear una sección:

Connections / Communication

Debe contemplar:

Serial

COM port.

Baud rate.

Data bits.

Stop bits.

Parity.

Flow control.

Read timeout.

Write timeout.

Baud rates frecuentes:

Protocolos/transportes futuros

UART.

USB Serial.

RS-232.

RS-485.

Modbus RTU.

Modbus ASCII.

Modbus TCP.

MQTT.

WebSocket.

HTTP/REST.

OPC-UA.

La UI debe permitir seleccionar posteriormente un driver y configurar sus parámetros.

MICROCONTROLADORES

Crear una sección conceptual:

Target Device

Preparada para:

Arduino Uno.

Arduino Mega.

Arduino Nano.

ESP32.

ESP32-S2.

ESP32-S3.

ESP32-C3.

ESP8266.

STM32.

RP2040.

Otros dispositivos.

Debe existir una pantalla de configuración del dispositivo con:

Nombre.

Modelo.

Puerto.

Baud rate.

Protocolo.

Resolución de pantalla.

Orientación.

Variables disponibles.

RESOLUCIONES Y TARGETS DE PANTALLA

El proyecto debe permitir configurar el tamaño de la interfaz destino.

Ejemplos:

240x320.

320x240.

480x272.

480x320.

800x480.

1024x600.

Resolución personalizada.

Permitir orientación:

Portrait.

Landscape.

PREPARACIÓN PARA EXPORTACIÓN A MICROCONTROLADORES

No implementar todavía el compilador real, pero crear la estructura visual para una futura función:

Build / Export

Opciones futuras:

Build UI.

Generate code.

Export project.

Upload to device.

Serial monitor.

Device information.

Firmware information.

Mostrar una pantalla de Build con:

Target.

Display resolution.

Memory estimate.

Assets.

Widgets.

Warnings.

Errors.

Build progress.

SERIAL MONITOR FUTURO

Crear una interfaz tipo terminal profesional para:

Seleccionar COM.

Baud rate.

Conectar/desconectar.

Ver RX.

Ver TX.

Limpiar terminal.

Pausar.

Timestamp.

Hex view.

ASCII view.

Esto debe quedar como frontend/mock inicialmente.

PROYECTO Y ARCHIVOS

Crear una estructura visual de proyecto:

Project
├── Screens
├── Widgets
├── Assets
├── Variables
├── Connections
├── Simulations
├── Targets
└── Settings

El usuario debe poder navegar esta estructura desde un Project Explorer.

VERSIONADO Y UNDO/REDO

El editor debe estar preparado para:

Undo.

Redo.

Historial.

Snapshots.

Versiones futuras.

No implementar necesariamente un backend de versionado, pero diseñar el estado del editor de forma que sea posible hacerlo posteriormente.

IMPORTANTE SOBRE EL BACKEND

Laravel será integrado posteriormente por mí.

Por tanto:

No crear lógica dependiente de un backend específico.

Crear interfaces TypeScript para entidades.

Crear mock repositories/services.

Separar UI, estado y acceso a datos.

Preparar REST API client.

No acoplar componentes directamente a fetch.

MODELO DE DATOS FRONTEND

Preparar tipos TypeScript conceptuales para:

Project.

Screen.

Element.

Widget.

WidgetInstance.

Variable.

Binding.

Behavior.

Animation.

State.

Event.

DataSource.

Connection.

TargetDevice.

Asset.

DISEÑO VISUAL PROFESIONAL

La aplicación debe parecer un software profesional de ingeniería, no una aplicación SaaS genérica.

Inspiración visual:

LabVIEW.

EEZ Studio.

Figma.

Adobe Illustrator.

IDEs profesionales.

HMI/SCADA industriales.

Usar:

Dark theme profesional.

Paneles dockeables visualmente.

Toolbar compacta.

Iconografía consistente.

Menús contextuales.

Tooltips.

Atajos de teclado.

Separadores redimensionables.

Canvas de alto rendimiento.

Estados visuales claros.

No utilizar tarjetas grandes tipo dashboard para la interfaz principal.

EXPERIENCIA DEL USUARIO

El flujo principal debe ser:

Crear proyecto.

Seleccionar resolución/target.

Crear pantalla.

Arrastrar widgets.

Importar SVG si se desea.

Explorar sus capas.

Seleccionar elementos.

Crear variables.

Crear bindings.

Agregar comportamientos.

Agregar animaciones.

Ejecutar simulación.

Validar la interfaz.

Prepararla para conexión al microcontrolador.

Futuramente compilar y cargar al dispositivo.

REGLA FUNDAMENTAL DE ARQUITECTURA

No codificar comportamientos específicos como componentes aislados siempre que puedan resolverse mediante el motor genérico.

Por ejemplo, no crear solamente:

FanWidget

Crear un motor capaz de decir:

element Rotor → rotation → bound to variable FAN_SPEED

De esa manera el mismo motor sirve para:

ventilador.

bomba.

motor.

hélice.

turbina.

banda.

mezclador.

engranaje.

brazo mecánico.

El objetivo es que la plataforma sea un constructor universal de interfaces visuales interactivas.

PRIORIDAD DE IMPLEMENTACIÓN DEL FRONTEND

Implementar visualmente y de forma funcional primero:

Shell/IDE profesional.

Project Explorer.

Widget Library.

Canvas.

Layers.

Inspector.

SVG importer/concepto de árbol SVG.

Element selection.

Variables.

Bindings.

Behaviors.

Animation engine básico.

Simulation mode.

Widget creation/reuse.

Target device UI.

Communication configuration UI.

Serial monitor mock.

Build/export mock.

Todo debe funcionar con datos mock en frontend y quedar listo para conectar posteriormente con Laravel y los drivers reales.

RESULTADO ESPERADO

El resultado debe ser el cascarón profesional de una futura plataforma de desarrollo de HMI para microcontroladores.

No quiero que Lovable intente resolver ahora el firmware, el protocolo de comunicación real ni el backend Laravel.

Quiero que construya correctamente la IDE visual, el editor de widgets, el motor conceptual de propiedades/bindings/animaciones, el sistema de simulación, la biblioteca de componentes, el importador SVG, las pantallas de configuración de comunicación y toda la UX necesaria para que posteriormente pueda conectar:

React Frontend → Laravel API → Communication/Build Engine → Microcontroller

La aplicación debe sentirse desde el primer momento como una herramienta profesional de ingeniería y no como un prototipo de dashboard.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/702de9ed-d075-4b7a-9bf4-dcc840ce5bf3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
