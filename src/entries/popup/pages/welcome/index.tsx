import React from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Button, Text, ThemeProvider } from '~/design-system';
import { Rows } from '~/design-system/components/Rows/Rows';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

import { FlyingRainbows } from '../../components/FlyingRainbows/FlyingRainbows';
import { LogoWithLetters } from '../../components/LogoWithLetters/LogoWithLetters';
import * as wallet from '../../handlers/wallet';

export function Welcome() {
  const navigate = useNavigate();
  const { setCurrentAddress } = useCurrentAddressStore();

  const handleImportWalletClick = React.useCallback(async () => {
    navigate('/import-or-connect');
  }, [navigate]);

  const handleCreateNewWalletClick = React.useCallback(async () => {
    const newWalletAddress = await wallet.create();
    setCurrentAddress(newWalletAddress);
    navigate('/seed-backup-prompt');
  }, [navigate, setCurrentAddress]);

  return (
    <FlyingRainbows>
      <Box
        width="full"
        style={{ zIndex: 1, paddingTop: 127 }}
        background="transparent"
      >
        <Box
          width="full"
          display="flex"
          justifyContent="center"
          paddingBottom="4px"
        >
          <LogoWithLetters color="label" />
        </Box>
        <Box
          width="full"
          justifyContent="center"
          alignItems="center"
          display="flex"
          style={{
            height: '21px',
          }}
        >
          <Text align="center" color="labelTertiary" size="16pt" weight="bold">
            {i18n.t('welcome.subtitle')}
          </Text>
        </Box>
        <Box width="full" style={{ marginTop: '226px' }}>
          <Rows alignVertical="top" space="20px">
            <Rows alignVertical="top" space="10px">
              <Button
                color="fill"
                height="44px"
                variant="flat"
                width="full"
                symbol="arrow.right"
                symbolSide="right"
                blur="26px"
                onClick={handleCreateNewWalletClick}
              >
                {i18n.t('welcome.create_wallet')}
              </Button>
              <ThemeProvider theme="dark">
                <Button
                  color="surfaceSecondaryElevated"
                  height="44px"
                  variant="flat"
                  width="full"
                  onClick={handleImportWalletClick}
                >
                  {i18n.t('welcome.import_wallet')}
                </Button>
              </ThemeProvider>
            </Rows>
            <Box display="flex" style={{ width: '210px', margin: 'auto' }}>
              <Text
                align="center"
                color="labelTertiary"
                size="12pt"
                weight="regular"
                as="p"
              >
                {i18n.t('welcome.disclaimer_tos')}&nbsp;
                <a
                  href="https://rainbow.me/terms-of-use"
                  target="_blank"
                  style={{ color: accentColorAsHsl }}
                  rel="noreferrer"
                >
                  {i18n.t('welcome.disclaimer_tos_link')}
                </a>
              </Text>
            </Box>
          </Rows>
        </Box>
      </Box>
    </FlyingRainbows>
  );
}
