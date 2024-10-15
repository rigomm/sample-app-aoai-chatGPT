import { useContext, useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Dialog, Stack, TextField } from '@fluentui/react'
import { CopyRegular, Document20Filled,  DocumentPdf20Filled,  DocumentBorderPrint20Filled, ArrowExportLtr20Filled, ArrowExportUp20Filled, ArrowDownload20Filled } from '@fluentui/react-icons'
import { ChatMessage, CosmosDBStatus, exportFile } from '../../api'
import Contoso from '../../assets/Contoso.svg'
import { HistoryButton, ShareButton } from '../../components/common/Button'
import { AppStateContext } from '../../state/AppProvider'
import { saveAs } from 'file-saver';
import styles from './Layout.module.css'
const [messages, setMessages] = useState<ChatMessage[]>([])

const Layout = () => {
  const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false)
  const [copyClicked, setCopyClicked] = useState<boolean>(false)
  const [copyText, setCopyText] = useState<string>('Copy URL')
  const [shareLabel, setShareLabel] = useState<string | undefined>('Share')
  const [hideHistoryLabel, setHideHistoryLabel] = useState<string>('Hide chat history')
  const [showHistoryLabel, setShowHistoryLabel] = useState<string>('Show chat history')
  const [logo, setLogo] = useState('')
  const appStateContext = useContext(AppStateContext)
  const ui = appStateContext?.state.frontendSettings?.ui

  const handleShareClick = () => {
    setIsSharePanelOpen(true)
  }

  const handleSharePanelDismiss = () => {
    setIsSharePanelOpen(false)
    setCopyClicked(false)
    setCopyText('Copy URL')
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopyClicked(true)
  }

  const handleHistoryClick = () => {
    appStateContext?.dispatch({ type: 'TOGGLE_CHAT_HISTORY' })
  }

  const onExporFileClicked = async (exportType:string) => {
    ///Get  current content
    console.log('on export file cliclet, messages')
    console.log(messages)
    let fileName= 'answer';
    switch(exportType){
        case 'Text':
          fileName =  `${fileName}.txt`;
        break;
        case 'PDF':
          fileName =  `${fileName}.pdf`;
        break;
        case 'Word':
          fileName =  `${fileName}.docx`;
        break;
    }

    // await exportFile(message??'', exportType) 
    // .then(async (response) => {
    //   var blob = await response.blob();

    //   saveAs(blob, fileName);
      
    // })
    // .catch((err) => {
    //   console.log(err);
      
    // });


  }

  useEffect(() => {
    if (!appStateContext?.state.isLoading) {
      setLogo(ui?.logo || Contoso)
    }
  }, [appStateContext?.state.isLoading])

  useEffect(() => {
    if (copyClicked) {
      setCopyText('Copied URL')
    }
  }, [copyClicked])

  useEffect(() => { }, [appStateContext?.state.isCosmosDBAvailable.status])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setShareLabel(undefined)
        setHideHistoryLabel('Hide history')
        setShowHistoryLabel('Show history')
      } else {
        setShareLabel('Share')
        setHideHistoryLabel('Hide chat history')
        setShowHistoryLabel('Show chat history')
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={styles.layout}>
      <header className={styles.header} role={'banner'}>
        <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
          <Stack horizontal verticalAlign="center">
            <img src={logo} className={styles.headerIcon} aria-hidden="true" alt="" />
            <Link to="/" className={styles.headerTitleContainer}>
              <h1 className={styles.headerTitle}>{ui?.title}</h1>
            </Link>
          </Stack>
          
          <Stack horizontal tokens={{ childrenGap: 4 }} className={styles.shareButtonContainer}>

          <Stack className={styles.exportButtonsRight}>
            <div className={styles.dropdownExportAll}>
            <ArrowDownload20Filled
                      aria-hidden="false"
                      aria-label="Export"
                      />
              <span>Export</span>
              <div className={styles.dropdownContentAll}>
                <div onClick={() => onExporFileClicked('Word')} className={[styles.accordionIcon, styles.dropdownItemAll].join(' ')}>
                <DocumentBorderPrint20Filled
                      aria-hidden="false"
                      aria-label="Word"
                      />
                      <span className={styles.spnExportAll}> Word</span>
                      </div>
                <div onClick={() => onExporFileClicked('PDF')} className={[styles.accordionIcon, styles.dropdownItemAll].join(' ')}>
                <DocumentPdf20Filled
                      aria-hidden="false"
                      aria-label="PDF"
                      />
                      <span className={styles.spnExportAll}> PDF</span>
                      </div>
                <div onClick={() => onExporFileClicked('Text')} className={[styles.accordionIcon, styles.dropdownItemAll].join(' ')}>
                <Document20Filled
                      aria-hidden="false"
                      aria-label="Text"
                      />
                      <span className={styles.spnExportAll}> Text</span>
                      </div>
              </div>
            </div>
            </Stack>


            {appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured && ui?.show_chat_history_button !== false && (
              <HistoryButton
                onClick={handleHistoryClick}
                text={appStateContext?.state?.isChatHistoryOpen ? hideHistoryLabel : showHistoryLabel}
              />
            )}
            {ui?.show_share_button && <ShareButton onClick={handleShareClick} text={shareLabel} />}
          </Stack>
        </Stack>
      </header>
      <Outlet />
      <Dialog
        onDismiss={handleSharePanelDismiss}
        hidden={!isSharePanelOpen}
        styles={{
          main: [
            {
              selectors: {
                ['@media (min-width: 480px)']: {
                  maxWidth: '600px',
                  background: '#FFFFFF',
                  boxShadow: '0px 14px 28.8px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  maxHeight: '200px',
                  minHeight: '100px'
                }
              }
            }
          ]
        }}
        dialogContentProps={{
          title: 'Share the web app',
          showCloseButton: true
        }}>
        <Stack horizontal verticalAlign="center" style={{ gap: '8px' }}>
          <TextField className={styles.urlTextBox} defaultValue={window.location.href} readOnly />
          <div
            className={styles.copyButtonContainer}
            role="button"
            tabIndex={0}
            aria-label="Copy"
            onClick={handleCopyClick}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? handleCopyClick() : null)}>
            <CopyRegular className={styles.copyButton} />
            <span className={styles.copyButtonText}>{copyText}</span>
          </div>
        </Stack>
      </Dialog>
    </div>
  )
}

export default Layout
