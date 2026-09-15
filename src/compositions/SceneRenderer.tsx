import React from "react";
import { Brand, Element, Scene } from "../schema";
import {
  AppWindow,
  CTAButton,
  ComparisonTable,
  CursorInteraction,
  FeaturePills,
  ImageElement,
  KineticText,
  LogoReveal,
  MetricCounter,
  ParticleTunnel,
  PhoneMockup,
  ProgressBar,
  SceneTransition,
  SplitScreen,
  TestimonialCard,
  NotificationCascade,
  AgentTaskCard,
  PromptInput,
  BentoGrid,
  ActionProgressModal,
  DepthOfFieldCards,
  PerspectiveCardGrid,
  CandidateNoiseField,
} from "../primitives";

interface Props {
  scene: Scene;
  brand: Brand;
}

export const SceneRenderer: React.FC<Props> = ({ scene, brand }) => {
  const renderPrimitive = (el: Element) => {
    switch (el.type) {
      case "kinetic-text":
        return <KineticText props={el.props} brand={brand} />;
      case "app-window":
        return <AppWindow props={el.props} brand={brand} deviceAssetId={el.deviceAssetId} cardStyleId={el.cardStyleId} />;
      case "logo-reveal":
        return <LogoReveal props={el.props} brand={brand} />;
      case "metric-counter":
        return <MetricCounter props={el.props} brand={brand} />;
      case "feature-pills":
        return <FeaturePills props={el.props} brand={brand} />;
      case "cta-button":
        return <CTAButton props={el.props} brand={brand} buttonStyleId={el.buttonStyleId} />;
      case "image":
        return <ImageElement props={el.props} brand={brand} />;
      case "split-screen":
        return <SplitScreen props={el.props} brand={brand} />;
      case "comparison-table":
        return <ComparisonTable props={el.props} brand={brand} />;
      case "testimonial-card":
        return <TestimonialCard props={el.props} brand={brand} />;
      case "progress-bar":
        return <ProgressBar props={el.props} brand={brand} />;
      case "phone-mockup":
        return <PhoneMockup props={el.props} brand={brand} />;
      case "cursor-interaction":
        return <CursorInteraction props={el.props} brand={brand} />;
      case "particle-tunnel":
        return <ParticleTunnel props={el.props} brand={brand} />;
      case "notification-cascade":
        return <NotificationCascade props={el.props} brand={brand} cardStyleId={el.cardStyleId} />;
      case "agent-task-card":
        return <AgentTaskCard props={el.props} brand={brand} cardStyleId={el.cardStyleId} />;
      case "prompt-input":
        return <PromptInput props={el.props} brand={brand} />;
      case "bento-grid":
        return <BentoGrid props={el.props} brand={brand} cardStyleId={el.cardStyleId} />;
      case "action-progress-modal":
        return <ActionProgressModal {...el.props} />;
      case "depth-of-field-cards":
        return <DepthOfFieldCards {...el.props} />;
      case "perspective-card-grid":
        return <PerspectiveCardGrid {...el.props} />;
      case "candidate-noise-field":
        return <CandidateNoiseField props={el.props} brand={brand} />;
      default:
        return null;
    }
  };

  const renderElement = (el: Element) => {
    const node = renderPrimitive(el);
    if (!node) return null;

    const z = el.z ?? 0;
    const isHero = el.importance === "hero";
    const isAmbient = el.importance === "ambient";

    return (
      <div
        key={el.id}
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `translate3d(0, 0, ${z}px)`,
          zIndex: isHero ? 30 : isAmbient ? 5 : 15,
          pointerEvents: "none",
        }}
      >
        <div style={{ width: "100%", height: "100%", position: "relative", pointerEvents: "auto" }}>
          {node}
        </div>
      </div>
    );
  };

  return (
    <SceneTransition
      background={scene.background}
      transition={scene.transition}
      durationFrames={scene.durationFrames}
      brand={brand}
      backgroundAssetId={scene.backgroundAssetId}
    >
      {scene.elements.map(renderElement)}
    </SceneTransition>
  );
};
