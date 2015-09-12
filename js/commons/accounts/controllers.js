// Generated by CoffeeScript 1.8.0
(function() {
  var module;

  module = angular.module("commons.accounts.controllers", ['commons.accounts.services', 'commons.base.services']);

  module.controller("CommunityCtrl", function($scope, Profile, ObjectProfileLink, DataSharing) {
    "Controller pour la manipulation des data d'une communauté liée à un objet partagé (project, fiche resource, etc.    )\nLa sémantique des niveaux d'implication est à préciser en fonction de la resource.\nA titre d'exemple, pour les projets et fiche ressource MakerScience :\n- 0 -> Membre de l'équipe projet\n- 1 -> personne ressource\n- 2 -> fan/follower\n\nNB. les objets \"profile\" manipulé ici sont les profils génériques du dataserver (et non les MakerScienceProfile)\n    dispo à api/v0/accounts/profile (cf service \"Profile\")";
    $scope.profiles = Profile.getList().$object;
    $scope.teamCandidate = null;
    $scope.resourceCandidate = null;
    $scope.currentUserCandidate = false;
    $scope.community = [];
    return $scope.init = function(objectTypeName) {
      console.log("init community ctrler");
      $scope.addMember = function(profile, level, detail, isValidated) {
        if ($scope.isAlreadyMember(profile, level)) {
          console.log(" --- ! -- already Member with this level --- ! ---");
          return true;
        }
        return ObjectProfileLink.one().customPOST({
          profile_id: profile.id,
          level: level,
          detail: detail,
          isValidated: isValidated
        }, $scope.objectTypeName + '/' + $scope.object.id).then(function(objectProfileLinkResult) {
          console.log(" Profile ?", profile.id);
          return $scope.community.push(objectProfileLinkResult);
        });
      };
      $scope.isAlreadyMember = function(profile, level) {
        var member, _i, _len, _ref;
        _ref = $scope.community;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          member = _ref[_i];
          if (member.profile.resource_uri === profile.resource_uri) {
            if (member.level === level) {
              return true;
            }
          }
        }
        return false;
      };
      $scope.removeMember = function(member) {
        return ObjectProfileLink.one(member.id).remove().then(function() {
          var memberIndex;
          memberIndex = $scope.community.indexOf(member);
          return $scope.community.splice(memberIndex, 1);
        });
      };
      $scope.validateMember = function($event, member) {
        var memberIndex, validated;
        validated = $event.target.checked;
        console.log(" Validating ?? !", validated);
        return ObjectProfileLink.one(member.id).patch({
          isValidated: validated
        }).then(memberIndex = $scope.community.indexOf(member), member = $scope.community[memberIndex], member.isValidated = validated);
      };
      $scope.updateMemberDetail = function(detail, member) {
        var memberIndex;
        return ObjectProfileLink.one(member.id).patch({
          detail: detail
        }).then(memberIndex = $scope.community.indexOf(member), member = $scope.community[memberIndex], member.detail = detail);
      };
      $scope.objectTypeName = objectTypeName;
      console.log(" Shared Object ? ", DataSharing.sharedObject);
      $scope.object = DataSharing.sharedObject[$scope.objectTypeName];
      if ($scope.object) {
        $scope.community = ObjectProfileLink.one().customGETLIST($scope.objectTypeName + '/' + $scope.object.id).$object;
      }
      return $scope.$watch(function() {
        return DataSharing.sharedObject;
      }, function(newVal, oldVal) {
        console.log(" Updating Shared Object : new =" + newVal + " old = " + oldVal);
        if (newVal !== oldVal) {
          $scope.object = newVal[$scope.objectTypeName];
          $scope.community = ObjectProfileLink.one().customGETLIST($scope.objectTypeName + '/' + $scope.object.id).$object;
          return console.log(" community B:", $scope.community);
        }
      });
    };
  });

}).call(this);