
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useClientPortalTokens } from '@/hooks/useClientPortalTokens';

interface ClientPortalButtonProps {
  customerId: string;
  customerEmail: string;
  customerName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const ClientPortalButton: React.FC<ClientPortalButtonProps> = ({
  customerId,
  customerEmail,
  customerName,
  variant = 'outline',
  size = 'sm'
}) => {
  const { sendMagicLink, loading } = useClientPortalTokens();

  const handleSendLink = async () => {
    await sendMagicLink(customerId, customerEmail);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSendLink}
      disabled={loading || !customerEmail}
      title={!customerEmail ? 'Customer email required' : `Send portal link to ${customerName}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4 mr-2" />
      )}
      Client Portal
    </Button>
  );
};

export default ClientPortalButton;
