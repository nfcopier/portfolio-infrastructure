import {Construct} from "constructs";
import {KubeConfig} from "./KubeConfig";
import {Release} from "@cdktf/provider-helm/lib/release";
import {Manifest} from "@cdktf/provider-kubernetes/lib/manifest";

interface CertManagerConfig {
    namespace: string;
    kubeConfig: KubeConfig;
    soaEmail: string;
}

export class CertManager extends Construct {

    private readonly helmRepository = "https://charts.jetstack.io";
    private readonly chart: string = "cert-manager";

    public constructor(scope: Construct, config: CertManagerConfig) {
        super(scope, "cert-manager");
        const release = this.Release(config.namespace, config.kubeConfig);
        this.StagingIssuer(config, release);
        this.ProdIssuer(config, release);
    }

    private Release(namespace: string, kubeConfig: KubeConfig): Release {
        return new Release(this, "release", {
            name: "cert-manager",
            namespace,
            repository: this.helmRepository,
            chart: this.chart,
            atomic: true,
            set: [{
                name: "installCRDs",
                value: "true"
            }],
            dependsOn: [kubeConfig]
        });
    }

    private StagingIssuer(config: CertManagerConfig, release: Release): void {
        new Manifest(this, "staging-issuer", {
            manifest: {
                apiVersion: "cert-manager.io/v1",
                kind: "ClusterIssuer",
                metadata: {
                    name: "letsencrypt-staging"
                },
                spec: {
                    acme: {
                        server: "https://acme-staging-v02.api.letsencrypt.org/directory",
                        email: config.soaEmail,
                        privateKeySecretRef: {
                            name: "letsencrypt-staging"
                        },
                        solvers: [{
                            http01: {
                                ingress: {
                                    class: "nginx"
                                }
                            }
                        }]
                    }
                }
            },
            dependsOn: [release]
        });
    }

    private ProdIssuer(config: CertManagerConfig, release: Release): void {
        new Manifest(this, "prod-issuer", {
            manifest: {
                apiVersion: "cert-manager.io/v1",
                kind: "ClusterIssuer",
                metadata: {
                    name: "letsencrypt-prod"
                },
                spec: {
                    acme: {
                        server: "https://acme-v02.api.letsencrypt.org/directory",
                        email: config.soaEmail,
                        privateKeySecretRef: {
                            name: "letsencrypt-prod"
                        },
                        solvers: [{
                            http01: {
                                ingress: {
                                    class: "nginx"
                                }
                            }
                        }]
                    }
                }
            },
            dependsOn: [release]
        });
    }
}
