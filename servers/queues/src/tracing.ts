// src/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { Resource } from '@opentelemetry/resources';
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";


const traceExporter = new JaegerExporter({
    endpoint: 'http://jaeger:14268/api/traces'
});

const metricReader = new PrometheusExporter({
    endpoint: 'http://prometheus:9090/metrics'    
})

const sdk = new NodeSDK({
    resource: Resource.default().merge(
        new Resource({
            "service.name": 'queue-server',
        })
    ),
    traceExporter,
    metricReader,
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': { enabled: false },
            '@opentelemetry/instrumentation-graphql': { enabled: true },
            '@opentelemetry/instrumentation-http': { enabled: true },
            '@opentelemetry/instrumentation-express': { enabled: true },
            '@opentelemetry/instrumentation-grpc': { enabled: true }
        })
    ]
});


// Inicializa el SDK (async)
export async function initTracing(): Promise<void> {
    try {
        sdk.start();

        console.log('Tracing initialized');
    } catch (err) {
        console.error('Error initializing tracing', err);
    }
}

