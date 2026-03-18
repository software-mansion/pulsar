package com.swmansion.pulsarapp.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.swmansion.pulsar.Pulsar

data class PresetItem(
    val name: String,
    val action: () -> Unit
)

@Composable
fun PresetsScreen(pulsar: Pulsar?) {
    val presets = androidx.compose.runtime.remember {
        listOf(
// CODEGEN_BEGIN_{example_app_preset_list}
            PresetItem("AimingFire") { pulsar?.getPresets()?.aimingFire() },
            PresetItem("AimingLock") { pulsar?.getPresets()?.aimingLock() },
            PresetItem("Alarm") { pulsar?.getPresets()?.alarm() },
            PresetItem("AngerFrustration") { pulsar?.getPresets()?.angerFrustration() },
            PresetItem("Applause") { pulsar?.getPresets()?.applause() },
            PresetItem("Attention") { pulsar?.getPresets()?.attention() },
            PresetItem("BalloonPop") { pulsar?.getPresets()?.balloonPop() },
            PresetItem("BangDoor") { pulsar?.getPresets()?.bangDoor() },
            PresetItem("Barrage") { pulsar?.getPresets()?.barrage() },
            PresetItem("BoredomFlat") { pulsar?.getPresets()?.boredomFlat() },
            PresetItem("Breath") { pulsar?.getPresets()?.breath() },
            PresetItem("BtnChip") { pulsar?.getPresets()?.btnChip() },
            PresetItem("BtnDestructive") { pulsar?.getPresets()?.btnDestructive() },
            PresetItem("BtnGhost") { pulsar?.getPresets()?.btnGhost() },
            PresetItem("BtnIcon") { pulsar?.getPresets()?.btnIcon() },
            PresetItem("BtnMenu") { pulsar?.getPresets()?.btnMenu() },
            PresetItem("BtnPrimary") { pulsar?.getPresets()?.btnPrimary() },
            PresetItem("BtnSecondary") { pulsar?.getPresets()?.btnSecondary() },
            PresetItem("BtnSubmit") { pulsar?.getPresets()?.btnSubmit() },
            PresetItem("BtnToggleOff") { pulsar?.getPresets()?.btnToggleOff() },
            PresetItem("Buildup") { pulsar?.getPresets()?.buildup() },
            PresetItem("CameraShutter") { pulsar?.getPresets()?.cameraShutter() },
            PresetItem("Cascade") { pulsar?.getPresets()?.cascade() },
            PresetItem("CleanStrike") { pulsar?.getPresets()?.cleanStrike() },
            PresetItem("CoinDrop") { pulsar?.getPresets()?.coinDrop() },
            PresetItem("CombinationLock") { pulsar?.getPresets()?.combinationLock() },
            PresetItem("Confirm") { pulsar?.getPresets()?.confirm() },
            PresetItem("Cowboy") { pulsar?.getPresets()?.cowboy() },
            PresetItem("Crescendo") { pulsar?.getPresets()?.crescendo() },
            PresetItem("CrossedEyes") { pulsar?.getPresets()?.crossedEyes() },
            PresetItem("Cursing") { pulsar?.getPresets()?.cursing() },
            PresetItem("DeepRumble") { pulsar?.getPresets()?.deepRumble() },
            PresetItem("DeepThud") { pulsar?.getPresets()?.deepThud() },
            PresetItem("DogBark") { pulsar?.getPresets()?.dogBark() },
            PresetItem("DoubleBeat") { pulsar?.getPresets()?.doubleBeat() },
            PresetItem("DoubleBlast") { pulsar?.getPresets()?.doubleBlast() },
            PresetItem("DoubleBurst") { pulsar?.getPresets()?.doubleBurst() },
            PresetItem("DoubleClick") { pulsar?.getPresets()?.doubleClick() },
            PresetItem("DoubleGentleTap") { pulsar?.getPresets()?.doubleGentleTap() },
            PresetItem("DoublePat") { pulsar?.getPresets()?.doublePat() },
            PresetItem("DoublePulse") { pulsar?.getPresets()?.doublePulse() },
            PresetItem("DoublePunch") { pulsar?.getPresets()?.doublePunch() },
            PresetItem("DoubleStrike") { pulsar?.getPresets()?.doubleStrike() },
            PresetItem("DoubleTap") { pulsar?.getPresets()?.doubleTap() },
            PresetItem("DoubleThud") { pulsar?.getPresets()?.doubleThud() },
            PresetItem("DoubleTriplet") { pulsar?.getPresets()?.doubleTriplet() },
            PresetItem("EngineRev") { pulsar?.getPresets()?.engineRev() },
            PresetItem("ErrorBuzz") { pulsar?.getPresets()?.errorBuzz() },
            PresetItem("ErrorSoft") { pulsar?.getPresets()?.errorSoft() },
            PresetItem("ExplodingHead") { pulsar?.getPresets()?.explodingHead() },
            PresetItem("Explosion") { pulsar?.getPresets()?.explosion() },
            PresetItem("EyeRolling") { pulsar?.getPresets()?.eyeRolling() },
            PresetItem("FadeOut") { pulsar?.getPresets()?.fadeOut() },
            PresetItem("FanfareShort") { pulsar?.getPresets()?.fanfareShort() },
            PresetItem("FirmImpact") { pulsar?.getPresets()?.firmImpact() },
            PresetItem("GameCombo") { pulsar?.getPresets()?.gameCombo() },
            PresetItem("GameHit") { pulsar?.getPresets()?.gameHit() },
            PresetItem("GameLevelUp") { pulsar?.getPresets()?.gameLevelUp() },
            PresetItem("GamePickup") { pulsar?.getPresets()?.gamePickup() },
            PresetItem("Glitch") { pulsar?.getPresets()?.glitch() },
            PresetItem("GravityFreefall") { pulsar?.getPresets()?.gravityFreefall() },
            PresetItem("GrinningSquinting") { pulsar?.getPresets()?.grinningSquinting() },
            PresetItem("GuitarStrum") { pulsar?.getPresets()?.guitarStrum() },
            PresetItem("Hail") { pulsar?.getPresets()?.hail() },
            PresetItem("HappinessJoyful") { pulsar?.getPresets()?.happinessJoyful() },
            PresetItem("HappinessLight") { pulsar?.getPresets()?.happinessLight() },
            PresetItem("Heartbeat") { pulsar?.getPresets()?.heartbeat() },
            PresetItem("HeavyImpact") { pulsar?.getPresets()?.heavyImpact() },
            PresetItem("KeyboardMechanical") { pulsar?.getPresets()?.keyboardMechanical() },
            PresetItem("KeyboardMembrane") { pulsar?.getPresets()?.keyboardMembrane() },
            PresetItem("KeyboardTypewriterOld") { pulsar?.getPresets()?.keyboardTypewriterOld() },
            PresetItem("KnockDoor") { pulsar?.getPresets()?.knockDoor() },
            PresetItem("LevelUp") { pulsar?.getPresets()?.levelUp() },
            PresetItem("LoaderBreathing") { pulsar?.getPresets()?.loaderBreathing() },
            PresetItem("LoaderPulse") { pulsar?.getPresets()?.loaderPulse() },
            PresetItem("LoaderRadar") { pulsar?.getPresets()?.loaderRadar() },
            PresetItem("LoaderSpin") { pulsar?.getPresets()?.loaderSpin() },
            PresetItem("LoaderWave") { pulsar?.getPresets()?.loaderWave() },
            PresetItem("Lock") { pulsar?.getPresets()?.lock() },
            PresetItem("LongPress") { pulsar?.getPresets()?.longPress() },
            PresetItem("MarioGameOver") { pulsar?.getPresets()?.marioGameOver() },
            PresetItem("MaxImpact") { pulsar?.getPresets()?.maxImpact() },
            PresetItem("MutedImpact") { pulsar?.getPresets()?.mutedImpact() },
            PresetItem("NeutralClear") { pulsar?.getPresets()?.neutralClear() },
            PresetItem("NeutralSteady") { pulsar?.getPresets()?.neutralSteady() },
            PresetItem("NewMessage") { pulsar?.getPresets()?.newMessage() },
            PresetItem("Notification") { pulsar?.getPresets()?.notification() },
            PresetItem("NotificationKnock") { pulsar?.getPresets()?.notificationKnock() },
            PresetItem("NotificationUrgent") { pulsar?.getPresets()?.notificationUrgent() },
            PresetItem("NotifyInfoStandard") { pulsar?.getPresets()?.notifyInfoStandard() },
            PresetItem("NotifyReminderFinal") { pulsar?.getPresets()?.notifyReminderFinal() },
            PresetItem("NotifyReminderNudge") { pulsar?.getPresets()?.notifyReminderNudge() },
            PresetItem("NotifyReminderSoft") { pulsar?.getPresets()?.notifyReminderSoft() },
            PresetItem("NotifySocialMention") { pulsar?.getPresets()?.notifySocialMention() },
            PresetItem("NotifySocialMessage") { pulsar?.getPresets()?.notifySocialMessage() },
            PresetItem("NotifySuccessSubtle") { pulsar?.getPresets()?.notifySuccessSubtle() },
            PresetItem("NotifyTimerDone") { pulsar?.getPresets()?.notifyTimerDone() },
            PresetItem("NotifyWarnMild") { pulsar?.getPresets()?.notifyWarnMild() },
            PresetItem("NotifyWarnModerate") { pulsar?.getPresets()?.notifyWarnModerate() },
            PresetItem("PassingCar") { pulsar?.getPresets()?.passingCar() },
            PresetItem("Pendulum") { pulsar?.getPresets()?.pendulum() },
            PresetItem("PowerDown") { pulsar?.getPresets()?.powerDown() },
            PresetItem("QuadBeat") { pulsar?.getPresets()?.quadBeat() },
            PresetItem("QuadRamp") { pulsar?.getPresets()?.quadRamp() },
            PresetItem("QuadThud") { pulsar?.getPresets()?.quadThud() },
            PresetItem("Rain") { pulsar?.getPresets()?.rain() },
            PresetItem("ReadySteadyGo") { pulsar?.getPresets()?.readySteadyGo() },
            PresetItem("ReliefSigh") { pulsar?.getPresets()?.reliefSigh() },
            PresetItem("ReliefSoft") { pulsar?.getPresets()?.reliefSoft() },
            PresetItem("Ripple") { pulsar?.getPresets()?.ripple() },
            PresetItem("SadnessMelancholic") { pulsar?.getPresets()?.sadnessMelancholic() },
            PresetItem("Searching") { pulsar?.getPresets()?.searching() },
            PresetItem("SearchSuccess") { pulsar?.getPresets()?.searchSuccess() },
            PresetItem("SelectionCrisp") { pulsar?.getPresets()?.selectionCrisp() },
            PresetItem("SelectionSnap") { pulsar?.getPresets()?.selectionSnap() },
            PresetItem("Shockwave") { pulsar?.getPresets()?.shockwave() },
            PresetItem("Sneezing") { pulsar?.getPresets()?.sneezing() },
            PresetItem("Spark") { pulsar?.getPresets()?.spark() },
            PresetItem("SuccessFlourish") { pulsar?.getPresets()?.successFlourish() },
            PresetItem("SuccessGentle") { pulsar?.getPresets()?.successGentle() },
            PresetItem("SupportSteady") { pulsar?.getPresets()?.supportSteady() },
            PresetItem("SupportStrong") { pulsar?.getPresets()?.supportStrong() },
            PresetItem("SurpriseGasp") { pulsar?.getPresets()?.surpriseGasp() },
            PresetItem("Tada") { pulsar?.getPresets()?.tada() },
            PresetItem("Thunder") { pulsar?.getPresets()?.thunder() },
            PresetItem("ThunderRoll") { pulsar?.getPresets()?.thunderRoll() },
            PresetItem("TickTock") { pulsar?.getPresets()?.tickTock() },
            PresetItem("TideSwell") { pulsar?.getPresets()?.tideSwell() },
            PresetItem("TripleBeat") { pulsar?.getPresets()?.tripleBeat() },
            PresetItem("TripleClick") { pulsar?.getPresets()?.tripleClick() },
            PresetItem("TripleDecay") { pulsar?.getPresets()?.tripleDecay() },
            PresetItem("TripleDrum") { pulsar?.getPresets()?.tripleDrum() },
            PresetItem("TripleEscalation") { pulsar?.getPresets()?.tripleEscalation() },
            PresetItem("TripleFade") { pulsar?.getPresets()?.tripleFade() },
            PresetItem("TripleGentleTap") { pulsar?.getPresets()?.tripleGentleTap() },
            PresetItem("TripleKnock") { pulsar?.getPresets()?.tripleKnock() },
            PresetItem("TriplePat") { pulsar?.getPresets()?.triplePat() },
            PresetItem("TriplePulse") { pulsar?.getPresets()?.triplePulse() },
            PresetItem("TripleStrike") { pulsar?.getPresets()?.tripleStrike() },
            PresetItem("TripleSurge") { pulsar?.getPresets()?.tripleSurge() },
            PresetItem("TripleTap") { pulsar?.getPresets()?.tripleTap() },
            PresetItem("TripleThud") { pulsar?.getPresets()?.tripleThud() },
            PresetItem("Victory") { pulsar?.getPresets()?.victory() },
            PresetItem("Vomiting") { pulsar?.getPresets()?.vomiting() },
            PresetItem("Vortex") { pulsar?.getPresets()?.vortex() },
            PresetItem("WarningPulse") { pulsar?.getPresets()?.warningPulse() },
            PresetItem("WarningSoft") { pulsar?.getPresets()?.warningSoft() },
            PresetItem("WarningUrgent") { pulsar?.getPresets()?.warningUrgent() },
            PresetItem("Waterfall") { pulsar?.getPresets()?.waterfall() },
            PresetItem("Woodpecker") { pulsar?.getPresets()?.woodpecker() },
            PresetItem("ZeldaChest") { pulsar?.getPresets()?.zeldaChest() },
            PresetItem("Zipper") { pulsar?.getPresets()?.zipper() },
// CODEGEN_END_{example_app_preset_list}
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            "Haptics Presets",
            fontSize = 24.sp,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(horizontal = 0.dp, vertical = 8.dp)
        ) {
            items(presets) { preset ->
                PresetItemRow(preset)
            }
        }
    }
}

@Composable
private fun PresetItemRow(preset: PresetItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            preset.name,
            modifier = Modifier
                .weight(1f)
                .padding(start = 16.dp),
            fontSize = 16.sp
        )
        Button(
            onClick = preset.action,
            modifier = Modifier.padding(end = 8.dp)
        ) {
            Text("Play")
        }
    }
}

