import java.io.IOException;
import java.net.InetSocketAddress;
import com.sun.net.httpserver.HttpServer;

public class Main {
    public static void main(String[] args) throws IOException {
        // Ottieni la porta dall'ambiente (Render imposta la variabile PORT)
        String port = System.getenv("PORT");
        if (port == null || port.isEmpty()) {
            port = "8080"; // Usa la porta di default se PORT non è definita
        }

        // Crea un server HTTP che ascolta sulla porta specificata
        HttpServer server = HttpServer.create(new InetSocketAddress(Integer.parseInt(port)), 0);
        server.createContext("/", exchange -> {
            String response = "Hello, SAPT!";
            exchange.sendResponseHeaders(200, response.getBytes().length);
            exchange.getResponseBody().write(response.getBytes());
            exchange.getResponseBody().close();
        });

        // Avvia il server
        server.start();
        System.out.println("Server started on port " + port);
    }
}

