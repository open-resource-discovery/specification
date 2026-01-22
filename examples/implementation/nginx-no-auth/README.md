# ORD Example Implementation with NGINX

## Description

This is example implements ORD by serving all information statically.
Of course this approach is limited and would only work for applications which are not system-instance-aware.

But it shows that ORD can be implemented without writing code, just by statically serving static metadata.

Please note that this example shouldn't promote manually creating ORD documents.
In the best case, they are generated automatically and derived from internal metadata / reflections.

## Docker

We use Docker to make the example portable.

```bash
docker build -t ord-nginx-implementation .
docker run -p 8080:80 ord-nginx-implementation
```

Now open it in the browser: http://localhost:8080/
