import VaultCanvas from "@/components/r3f/VaultCanvas";
import EncryptedTextDemoSecond from "@/components/encrypted-text-demo-2";

export const metadata = {
  title: "Vault. — descent (prototype)",
};

export default function Lab() {
  return (
    <div className="relative min-h-screen bg-neutral-900 text-white">
      <div className="p-8 border-b border-neutral-800">
        <h1 className="text-xl font-bold mb-2">Encrypted Text Demo</h1>
        <EncryptedTextDemoSecond />
      </div>
      <VaultCanvas />
    </div>
  );
}
