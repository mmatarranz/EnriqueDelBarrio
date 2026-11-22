<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

// Honeypot anti-spam
if (!empty($data['_honey'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$name = trim(strip_tags($data['name'] ?? ''));
$email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$service = trim(strip_tags($data['servicio'] ?? 'Consulta general'));
$message = trim(strip_tags($data['mensaje'] ?? ''));

if ($name === '' || !$email || $message === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Por favor, completa todos los campos obligatorios.']);
    exit;
}

$to = 'info@enriquedelbarrio.es';
$subject = "=?UTF-8?B?" . base64_encode("Nueva consulta web ($service) — $name") . "?=";

$body = "Has recibido una nueva consulta desde enriquedelbarrio.es:\n\n"
      . "Nombre: $name\n"
      . "Email: $email\n"
      . "Servicio: $service\n"
      . "----------------------------------------\n"
      . "Mensaje:\n$message\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Web Enrique del Barrio <info@enriquedelbarrio.es>',
    "Reply-To: $name <$email>",
    'X-Mailer: PHP/' . phpversion(),
];

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo enviar el correo desde el servidor.']);
}
