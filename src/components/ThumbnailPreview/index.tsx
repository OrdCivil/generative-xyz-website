import ButtonIcon from '@components/ButtonIcon';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import ClientOnly from '@components/Utils/ClientOnly';
import { CDN_URL, GLB_COLLECTION_ID } from '@constants/config';
import SandboxPreview from '@components/SandboxPreview';
import { PreviewDisplayMode } from '@enums/mint-generative';
import { ISandboxRef } from '@interfaces/sandbox';
import { Token } from '@interfaces/token';
import { base64ToUtf8 } from '@utils/format';
import { generateHash } from '@utils/generate-data';
import { convertIpfsToHttp } from '@utils/image';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import s from './styles.module.scss';
import { ROUTE_PATH } from '@constants/route-path';
import { useRouter } from 'next/router';

type Props = {
  data: Token | null;
  allowVariantion?: boolean;
  previewToken?: boolean;
  isBitcoinProject?: boolean;
};

const ThumbnailPreview = (props: Props) => {
  const {
    data,
    allowVariantion = false,
    previewToken = false,
    // isBitcoinProject,
  } = props;
  const router = useRouter();
  const { projectID } = router.query;
  const animationUrl = data?.animationUrl || data?.animation_url || '';
  const thumbnailPreviewUrl = data?.image;
  const sandboxRef = useRef<ISandboxRef>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const [displayMode, setDisplayMode] = useState<PreviewDisplayMode>();
  const [hash, setHash] = useState<string>(generateHash());
  const [isVideo, setIsVideo] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const rawHtmlFile = base64ToUtf8(
    animationUrl.replace('data:text/html;base64,', '')
  );

  const thumbnailExt = useMemo(() => {
    return thumbnailPreviewUrl?.split('.').pop();
  }, [thumbnailPreviewUrl]);

  const handleIframeLoaded = (): void => {
    if (sandboxRef.current) {
      const iframe = sandboxRef.current.getHtmlIframe();
      if (iframe) {
        // @ts-ignore: Allow read iframe's window object
        setPreviewSrc(iframe.src);
      }
    }
  };

  const reloadIframe = (): void => {
    if (sandboxRef.current) {
      sandboxRef.current.reloadIframe();
    }
  };

  const handlePlay = (): void => {
    setDisplayMode(PreviewDisplayMode.ANIMATION);
  };

  const handlePause = (): void => {
    setDisplayMode(PreviewDisplayMode.THUMBNAIL);
  };

  const handleVariation = (): void => {
    setHash(generateHash());
  };

  const canPlay = useMemo(() => {
    return !!rawHtmlFile && displayMode === PreviewDisplayMode.THUMBNAIL;
  }, [rawHtmlFile, displayMode]);

  const canPause = useMemo(() => {
    return !!rawHtmlFile && displayMode === PreviewDisplayMode.ANIMATION;
  }, [rawHtmlFile, displayMode]);

  const openPreview = useMemo(() => !!previewSrc, [previewSrc]);

  useEffect(() => {
    if (animationUrl) {
      setDisplayMode(PreviewDisplayMode.ANIMATION);
    } else {
      setDisplayMode(PreviewDisplayMode.THUMBNAIL);
    }
  }, [animationUrl]);

  useEffect(() => {
    if (data?.image) {
      const checkMP4 = data?.image.split('.').pop() === 'mp4';
      setIsVideo(checkMP4);
    }
  }, [data?.image]);

  const renderThumbnailByExt = () => {
    if (thumbnailPreviewUrl) {
      if (thumbnailExt && thumbnailExt === 'glb' && data) {
        return (
          <ClientOnly>
            <div className={s.objectPreview}>
              <iframe
                className={s.iframeContainer}
                src={`${ROUTE_PATH.OBJECT_PREVIEW}/${data.tokenID}`}
                style={{ overflow: 'hidden' }}
              />
            </div>
          </ClientOnly>
        );
      }
      // TODO: show animation for GLB project
      if (projectID === GLB_COLLECTION_ID) {
        return (
          <ClientOnly>
            <div className={s.objectPreview}>
              <iframe
                className={s.iframeContainer}
                src={`${ROUTE_PATH.GLTF_PREVIEW}?defaultUrl=true`}
                style={{ overflow: 'hidden' }}
              />
            </div>
          </ClientOnly>
        );
      }
      return (
        <Image
          fill
          src={convertIpfsToHttp(thumbnailPreviewUrl)}
          alt="thumbnail"
        ></Image>
      );
    }
    return null;
  };

  return (
    <div className={s.ThumbnailPreview}>
      <div className={s.wrapper}>
        <div className={s.sandboxWrapper}>
          <Skeleton fill isLoaded={!!data} />
          {data && (
            <>
              <div className={s.sandboxContent}>
                <ClientOnly>
                  <SandboxPreview
                    showIframe={displayMode === PreviewDisplayMode.ANIMATION}
                    rawHtml={rawHtmlFile}
                    ref={sandboxRef}
                    hash={previewToken ? data.tokenID : hash}
                    sandboxFiles={null}
                    onLoaded={handleIframeLoaded}
                    className={s.thumbnail_iframe}
                  />
                </ClientOnly>
              </div>
              {displayMode === PreviewDisplayMode.THUMBNAIL &&
                thumbnailPreviewUrl && (
                  <div className={s.thumbnail_image}>
                    {isVideo ? (
                      <video autoPlay loop muted playsInline preload="auto">
                        <source src={thumbnailPreviewUrl} type="video/mp4" />
                      </video>
                    ) : (
                      renderThumbnailByExt()
                    )}
                  </div>
                )}
            </>
          )}
        </div>
        {animationUrl && (
          <div className={s.actionWrapper}>
            <div className={s.sandboxControls}>
              {allowVariantion &&
                displayMode === PreviewDisplayMode.ANIMATION && (
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip id="variation-tooltip">
                        <Text
                          size="14"
                          fontWeight="semibold"
                          color="primary-333"
                        >
                          variation
                        </Text>
                      </Tooltip>
                    }
                  >
                    <ButtonIcon
                      onClick={handleVariation}
                      className={s.actionBtn}
                      sizes="mid"
                      variants="outline"
                      ref={playBtnRef}
                      iconOnly
                    >
                      <Image
                        alt="play icon"
                        width={16}
                        height={16}
                        src={`${CDN_URL}/icons/ic-shuffle-24x24.svg`}
                      ></Image>
                    </ButtonIcon>
                  </OverlayTrigger>
                )}
              {canPlay && (
                <OverlayTrigger
                  placement="bottom"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip id="play-tooltip">
                      <Text size="14" fontWeight="semibold" color="primary-333">
                        play
                      </Text>
                    </Tooltip>
                  }
                >
                  <ButtonIcon
                    onClick={handlePlay}
                    className={s.actionBtn}
                    sizes="mid"
                    variants="outline"
                    iconOnly
                  >
                    <Image
                      alt="play icon"
                      width={16}
                      height={16}
                      src={`${CDN_URL}/icons/ic-play-14x14.svg`}
                    ></Image>
                  </ButtonIcon>
                </OverlayTrigger>
              )}
              {canPause && (
                <OverlayTrigger
                  placement="bottom"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip id="pause-tooltip">
                      <Text size="14" fontWeight="semibold" color="primary-333">
                        pause
                      </Text>
                    </Tooltip>
                  }
                >
                  <ButtonIcon
                    onClick={handlePause}
                    className={s.actionBtn}
                    sizes="mid"
                    variants="outline"
                    iconOnly
                  >
                    <Image
                      alt="pause icon"
                      width={16}
                      height={16}
                      src={`${CDN_URL}/icons/ic-pause-14x14.svg`}
                    ></Image>
                  </ButtonIcon>
                </OverlayTrigger>
              )}
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 400 }}
                overlay={
                  <Tooltip id="reload-tooltip">
                    <Text size="14" fontWeight="semibold" color="primary-333">
                      reload
                    </Text>
                  </Tooltip>
                }
              >
                <ButtonIcon
                  onClick={reloadIframe}
                  className={s.actionBtn}
                  sizes="mid"
                  variants="outline"
                  iconOnly
                >
                  <Image
                    alt="refresh icon"
                    width={16}
                    height={16}
                    src={`${CDN_URL}/icons/ic-refresh-14x14.svg`}
                  ></Image>
                </ButtonIcon>
              </OverlayTrigger>

              {openPreview && previewSrc && (
                <OverlayTrigger
                  placement="bottom"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip id="expand-tooltip">
                      {' '}
                      <Text size="14" fontWeight="semibold" color="primary-333">
                        expand
                      </Text>
                    </Tooltip>
                  }
                >
                  <Link href={previewSrc} target="_blank">
                    <ButtonIcon
                      className={s.actionBtn}
                      sizes="mid"
                      variants="outline"
                      iconOnly
                    >
                      <Image
                        alt="pause icon"
                        width={16}
                        height={16}
                        src={`${CDN_URL}/icons/ic-expand.svg`}
                      ></Image>
                    </ButtonIcon>
                  </Link>
                </OverlayTrigger>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailPreview;
