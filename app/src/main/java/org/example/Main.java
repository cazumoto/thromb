import java.io.IOException;
import java.net.InetSocketAddress;
import com.sun.net.httpserver.HttpServer;

public class Main {
    public static void main(String[] args) throws IOException {
        // Usa la porta 8080
        String port = "8080"; 

        // Crea un server HTTP che ascolta sulla porta specificata
        HttpServer server = HttpServer.create(new InetSocketAddress(Integer.parseInt(port)), 0);
        server.createContext("/", exchange -> {
            String response = "Hello, thromb!";
            exchange.sendResponseHeaders(200, response.getBytes().length);
            exchange.getResponseBody().write(response.getBytes());
            exchange.getResponseBody().close();
        });

        // Avvia il server
        server.start();
        System.out.println("Server started on port " + port);
    }
}
