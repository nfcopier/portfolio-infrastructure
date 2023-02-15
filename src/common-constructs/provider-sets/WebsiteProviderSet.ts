import {Construct} from "constructs";
import {LinodeProvider} from "../../../.gen/providers/linode/provider";
import {LocalProvider} from "@cdktf/provider-local/lib/provider";
import {TlsProvider} from "@cdktf/provider-tls/lib/provider";

export class WebsiteProviderSet {

    public constructor(scope: Construct) {
        new LinodeProvider(scope, "linode-provider");
        new LocalProvider(scope, "local-provider");
        new TlsProvider(scope, "tls-provider");
    }
}
