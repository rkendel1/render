import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code } from "@/components/code";

export const metadata = {
  title: "Installation | json-render",
};

export default function InstallationPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Installation</h1>
      <p className="text-muted-foreground mb-8">
        Install the core and React packages to get started.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Install packages</h2>
      <Code lang="bash">npm install @json-render/core @json-render/react</Code>

      <p className="text-sm text-muted-foreground mb-4">Or with other package managers:</p>
      <Code lang="bash">{`# pnpm
pnpm add @json-render/core @json-render/react

# yarn
yarn add @json-render/core @json-render/react

# bun
bun add @json-render/core @json-render/react`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Peer Dependencies</h2>
      <p className="text-sm text-muted-foreground mb-4">
        json-render requires the following peer dependencies:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li><code className="text-foreground">react</code> ^19.0.0</li>
        <li><code className="text-foreground">zod</code> ^3.0.0</li>
      </ul>
      <Code lang="bash">npm install react zod</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">For AI Integration</h2>
      <p className="text-sm text-muted-foreground mb-4">
        To use json-render with AI models, you&apos;ll also need the Vercel AI SDK:
      </p>
      <Code lang="bash">npm install ai</Code>

      <div className="flex gap-3 mt-12">
        <Button size="sm" asChild>
          <Link href="/docs/quick-start">Quick Start</Link>
        </Button>
      </div>
    </article>
  );
}
